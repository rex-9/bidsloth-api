import { CONFIGS } from "@/configs";
import { Request } from "express";
import CustomError from "@/utilities/custom-error";
import Joi from "joi";

import { calculateDeliveryFee, insideDateTime } from "@/utilities/helpers";
import { PaymentStatus, ShipType, currencies, Destination, Address, ErrorMessage } from "@/utilities/constants";
import mailService from "./mail.service";
import CreatorModel, { ICreator } from "@/models/creator.model";
import AuctionModel from "@/models/auction.model";
import BidderModel, { IBidder } from "@/models/bidder.model";
import { IPromo } from "@/models/promo.model";
import SchedulerService from "./scheduler.service";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const stripe = require("stripe")(CONFIGS.STRIPE.STRIPE_SECRET_KEY);

class StripeService {
    // Stripe Helper Functions ===> Start
    async createAccount(email: string) {
        const account = await stripe.accounts.create({
            type: "standard",
            email: email,
            settings: {
                payouts: {
                    schedule: {
                        interval: "manual", // Escrow
                    },
                },
            },
        });
        return account;
    }

    async createAccountLink(id: string, refresh_url: string, return_url: string) {
        const accountLink = await stripe.accountLinks.create({
            account: id,
            refresh_url: refresh_url,
            return_url: return_url,
            type: "account_onboarding",
        });
        return accountLink;
    }

    async createProduct(name: string, description: string, accountId: string) {
        const product = await stripe.products.create(
            {
                name: name,
                description: description,
            },
            {
                stripeAccount: accountId,
            }
        );

        return product;
    }

    async createPrice(productId: string, winningBid: any, currency: string, accountId: string, deliveryFee: number) {
        const price = await stripe.prices.create(
            {
                product: productId,
                unit_amount: (winningBid.bidAmount + deliveryFee) * 100,
                currency: currency,
            },
            {
                stripeAccount: accountId,
            }
        );

        // console.log('Price created with Winning Bid Amount: ', winningBid.bidAmount);

        return price;
    }

    async createSession(priceId: string, winningBid: any, accountId: string, success_url: string, cancel_url: string, fee: number) {
        const session = await stripe.checkout.sessions.create(
            {
                mode: "payment",
                line_items: [
                    {
                        price: priceId,
                        quantity: 1,
                    },
                ],
                payment_intent_data: {
                    application_fee_amount: winningBid.bidAmount * fee * 100,
                },
                success_url: success_url,
                cancel_url: cancel_url,
                billing_address_collection: "required",
            },
            {
                stripeAccount: accountId,
            }
        );

        return session;
    }
    // Stripe Helper Functions ===> End

    async enableEscrow({ body, $currentUser }: Partial<Request>) {
        const { error, value: data } = Joi.object({
            body: Joi.object({
                accountId: Joi.string().required(),
            }),
        })
            .options({ stripUnknown: true })
            .validate({ body, $currentUser });

        if (error) throw new CustomError(error.message, 400);

        const account = await stripe.accounts.update(data.body.accountId, {
            settings: {
                payouts: {
                    schedule: {
                        interval: "manual", // manual payout to the creator when the winner received the product
                    },
                },
            },
        });

        return { message: "Enabled as an Escrow account successfully!", account };
    }

    async onboard({ body, $currentUser }: Partial<Request>) {
        const { error, value: data } = Joi.object({
            body: Joi.object({
                refreshUrl: Joi.string().required(),
                returnUrl: Joi.string().required(),
            }),
            $currentUser: Joi.object({
                _id: Joi.required(),
            }),
        })
            .options({ stripUnknown: true })
            .validate({ body, $currentUser });

        if (error) throw new CustomError(error.message, 400);

        const creator = await CreatorModel.findOne({ _id: data.$currentUser._id });

        if (!creator) throw new CustomError(ErrorMessage.creator_not_found, 400);

        if (creator.isStripeConnected) throw new CustomError(ErrorMessage.stripe_fully_connected, 400);

        // Create a new Stripe account if creator doesn't have a stripeId
        if (!creator.stripeId) {
            const account = await this.createAccount(creator.email);
            creator.stripeId = account.id;
        }

        // Link with the created Stripe account
        const accountLink = await this.createAccountLink(creator.stripeId as string, data.body.refreshUrl, data.body.returnUrl);

        // Update the Creator with the Stripe account ID
        await CreatorModel.findOneAndUpdate({ _id: data.$currentUser._id }, { stripeId: creator.stripeId, updatedAt: Date.now() }, { new: true });

        return accountLink.url;
    }

    async isAccountConnected({ $currentUser }: Partial<Request>) {
        const { error, value: data } = Joi.object({
            $currentUser: Joi.object({
                _id: Joi.required(),
            }),
        })
            .options({ stripUnknown: true })
            .validate({ $currentUser });

        if (error) throw new CustomError(error.message, 400);

        const creator = await CreatorModel.findOne({ _id: data.$currentUser._id });
        if (!creator) throw new CustomError(ErrorMessage.creator_not_found, 400);

        if (!creator.stripeId) throw new CustomError(ErrorMessage.stripe_not_connected_at_all, 400);

        // Retrieve the Stripe account
        const account = await stripe.accounts.retrieve(creator.stripeId);

        const isFullyConnected = account.charges_enabled && account.details_submitted && account.payouts_enabled;

        if (!isFullyConnected) throw new CustomError(ErrorMessage.stripe_not_fully_connected, 400);

        await CreatorModel.findOneAndUpdate({ stripeId: creator.stripeId }, { isStripeConnected: true, updatedAt: Date.now() }, { new: true });

        return true;
    }

    async retrieve({ body }: Partial<Request>) {
        const { error, value: data } = Joi.object({
            body: Joi.object({
                accountId: Joi.string().required(),
            }),
        })
            .options({ stripUnknown: true })
            .validate({ body });

        if (error) throw new CustomError(error.message, 400);

        // Retrieve the Stripe account
        const account = await stripe.accounts.retrieve(data.body.accountId);

        return account;
    }

    async delete({ body }: Partial<Request>) {
        const { error, value: data } = Joi.object({
            body: Joi.object({
                accountId: Joi.string().required(),
            }),
        })
            .options({ stripUnknown: true })
            .validate({ body });

        if (error) throw new CustomError(error.message, 400);

        // Delete the created account
        const account = await stripe.accounts.del(data.body.accountId);

        return account;
    }

    async generateCheckoutUrl({ body }: Partial<Request>) {
        const { error, value: data } = Joi.object({
            body: Joi.object({
                auctionId: Joi.required(),
                successUrl: Joi.string().required(),
                cancelUrl: Joi.string().required(),
            }),
        })
            .options({ stripUnknown: true })
            .validate({ body });

        if (error) throw new CustomError(error.message, 400);

        const auction = await AuctionModel.findOne({ _id: data.body.auctionId }).populate("winningBid", "bidAmount");

        // Auction doesn't exist
        if (!auction) throw new CustomError(ErrorMessage.auction_not_found, 400);

        // Auction still ongoing
        if (insideDateTime(String(auction?.startDateTime), String(auction?.endDateTime))) throw new CustomError(ErrorMessage.auction_ongoing, 400);

        // Get the creator of the auction
        const creator = await CreatorModel.findOne({ _id: auction.creator }).populate("promo", "code auctionCount percentFee");

        // creator of this auction doesn't exist
        if (!creator) throw new CustomError(ErrorMessage.creator_not_found, 400);

        // find auctions of the creator in the latest first order
        const auctions = await AuctionModel.find({ creator: creator._id }).sort({ createdAt: -1 });

        creator.auctions = auctions;

        let isDiscountAuction = false;

        let fee = 0.1; // default 10 percent fee

        if (creator.promo) {
            // if creator has promo code check if it's still valid
            const promo: IPromo | undefined = creator.promo as IPromo;

            isDiscountAuction = creator.auctions.length <= promo.auctionCount;

            if (isDiscountAuction) {
                fee = promo.percentFee / 100;
            }
        }

        if (!auction.winningBid) {
            // Mail the creator that auction failed
            await mailService.sendAuctionFailedMailToCreator({ creator: { name: creator?.username as string, email: creator?.email as string } });

            // delete schedulers and cancel jobs
            await SchedulerService.cancelSchedulers(auction?._id, creator?.username as string);

            // mark the auction as ended
            await AuctionModel.findOneAndUpdate({ _id: auction._id }, { ended: true });
        }

        if (!auction.winningBid) return null;

        if (!auction.stripeProductId) {
            // Create a product in Stripe
            const product = await this.createProduct(`${creator?.username} - ${auction.title}`, auction.description as string, creator?.stripeId as string);

            auction.stripeProductId = product.id;

            // Add the product ID to the auction
            await AuctionModel.findOneAndUpdate({ _id: auction._id }, { stripeProductId: auction.stripeProductId });
        }

        if (!auction.stripePriceId) {
            // Calculate a delivery fee
            const deliveryFee = calculateDeliveryFee(auction.shipType as ShipType, auction.destination as Destination);

            // Create a price in Stripe
            const price = await this.createPrice(auction.stripeProductId as string, auction.winningBid, auction.currency as string, creator.stripeId as string, deliveryFee);

            auction.stripePriceId = price.id;

            // Add the price ID to the auction
            await AuctionModel.findOneAndUpdate({ _id: auction._id }, { stripePriceId: auction.stripePriceId });
        }

        if (!auction.stripeSessionId) {
            // Create a session to checkout in Stripe
            const session = await this.createSession(auction.stripePriceId as string, auction.winningBid, creator.stripeId as string, data.body.successUrl, data.body.cancelUrl, fee);

            auction.stripeSessionId = session.id;

            auction.stripeCheckoutUrl = session.url;

            // Add the session ID and the checkout URL to the auction
            await AuctionModel.findOneAndUpdate({ _id: auction._id }, { stripeSessionId: auction.stripeSessionId, stripeCheckoutUrl: auction.stripeCheckoutUrl });
        }

        return auction.stripeCheckoutUrl;
    }

    async getCheckoutPage({ params }: Partial<Request>) {
        const { error, value: data } = Joi.object({
            params: Joi.object({
                auctionId: Joi.string().required(),
            }),
        })
            .options({ stripUnknown: true })
            .validate({ params });

        if (error) throw new CustomError(error.message, 400);

        // get the auction
        const auction = await AuctionModel.findById(data.params.auctionId);
        if (!auction) throw new CustomError(ErrorMessage.auction_not_found, 400);

        return auction.stripeCheckoutUrl;
    }

    async releasePayout({ params }: Partial<Request>) {
        const { error, value: data } = Joi.object({
            params: Joi.object({
                auctionId: Joi.string().required(),
            }),
        })
            .options({ stripUnknown: true })
            .validate({ params });

        if (error) throw new CustomError(error.message, 400);

        // get the auction
        const auction = await AuctionModel.findById(data.params.auctionId).populate("creator", "stripeId").populate("winner", "name");
        if (!auction) throw new CustomError(ErrorMessage.auction_not_found, 400);

        const creator = auction.creator as ICreator;

        const winner = auction.winner as IBidder;

        const retrievedCharge = await stripe.charges.list(
            {
                payment_intent: auction.paymentIntentId,
            },
            {
                stripeAccount: creator?.stripeId,
            }
        );

        const retrievedTransaction = await stripe.balanceTransactions.retrieve(
            retrievedCharge.data[0].balance_transaction,
            {
                expand: ["fee_details"],
            },
            {
                stripeAccount: creator?.stripeId,
            }
        );

        const balance = await stripe.balance.retrieve({
            stripeAccount: creator?.stripeId,
        });

        console.log("Balance: ", balance);

        const payout = await stripe.payouts.create(
            {
                amount: retrievedTransaction.net,
                currency: auction.currency,
            },
            {
                stripeAccount: creator?.stripeId,
            }
        );

        console.log("Payout: ", payout);

        // mark the auction as payout complete
        await AuctionModel.findByIdAndUpdate(data.params.auctionId, { payoutComplete: true, updatedAt: Date.now() }, { new: true });

        const ratingPageUrl = `${CONFIGS.URL.LANDING_BASE_URL}/rate?auctionId=${data.params.auctionId}&creatorId=${creator._id}&bidderId=${winner._id}`;

        return ratingPageUrl;
    }

    async getTxns({ $currentUser }: Partial<Request>) {
        const { error, value: data } = Joi.object({
            $currentUser: Joi.object({
                _id: Joi.required(),
                stripeId: Joi.string().required(),
            }),
        })
            .options({ stripUnknown: true })
            .validate({ $currentUser });

        if (error) throw new CustomError(error.message, 400);

        // Fetch auction histories
        const auctions = await AuctionModel.find({ creator: data.$currentUser._id, ended: true }).sort({ createdAt: -1 });

        try {
            const transactions = await Promise.all(
                auctions.map(async (auction: any) => {
                    let transaction = {};
                    if (auction.winningBid) {
                        const retrievedCharge = await stripe.charges.list(
                            {
                                payment_intent: auction.paymentIntentId,
                            },
                            {
                                stripeAccount: $currentUser?.stripeId,
                            }
                        );

                        const retrievedTransaction = await stripe.balanceTransactions.retrieve(
                            retrievedCharge.data[0].balance_transaction,
                            {
                                expand: ["fee_details"],
                            },
                            {
                                stripeAccount: $currentUser?.stripeId,
                            }
                        );

                        const feeDetails = retrievedTransaction.fee_details.map((fee: any) => ({
                            type: fee.type,
                            amount: fee.amount,
                            currency: fee.currency,
                        }));

                        transaction = {
                            id: retrievedTransaction.id,
                            amount: retrievedTransaction.amount,
                            fee: retrievedTransaction.fee,
                            net: retrievedTransaction.net,
                            feeDetails: feeDetails,
                            exchangeRate: retrievedTransaction.exchange_rate,
                            receiptUrl: retrievedCharge.data[0].receipt_url,
                            created: retrievedTransaction.created,
                        };
                    } else {
                        transaction = {
                            id: null,
                            amount: 0,
                            fee: 0,
                            net: 0,
                            feeDetails: null,
                            exchangeRate: 0,
                            receiptUrl: null,
                            created: false,
                        };
                    }

                    return {
                        ...auction,
                        transaction,
                    };
                })
            );

            return transactions;
        } catch (error) {
            console.error("Error retrieving transactions:", error);
            throw error;
        }
    }

    async webhooks(req: Partial<Request>) {
        // This is your Stripe CLI webhook secret for testing your endpoint locally.
        const endpointSecret = CONFIGS.STRIPE.WEBHOOK_SECRET_KEY;

        let sig: any;

        // Check if headers are defined before accessing its properties
        if (req.headers) sig = req.headers["stripe-signature"];

        let event;

        try {
            event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
            console.log("EVENT: " + event);
        } catch (err: any) {
            console.log("❌ Error:", err);
            throw new CustomError(`Webhook Error: ${err.message}`, 400);
        }

        // Handle the event
        switch (event.type) {
            // ... handle account updated event in onboarding process
            case "account.updated": {
                const updatedAccount = event.data.object;
                // console.log('Updated Account: ', updatedAccount);
                // if all the required fields are completed successfully, update the isStripeConnected property of the creator
                if (updatedAccount.charges_enabled && updatedAccount.payouts_enabled && updatedAccount.details_submitted) await CreatorModel.findOneAndUpdate({ stripeId: updatedAccount.id }, { isStripeConnected: true, updatedAt: Date.now() }, { new: true });

                break;
            }

            // ... handle checkout session completed event in payment process
            case "checkout.session.completed": {
                const completedCheckoutSession = event.data.object;
                // console.log('Completed Checkout Session: ', completedCheckoutSession)

                // If payment completed successfully, update the paymentStatus property of the auction
                const auction = await AuctionModel.findOneAndUpdate(
                    { stripeSessionId: completedCheckoutSession.id },
                    { paymentStatus: PaymentStatus.COMPLETE, paymentIntentId: completedCheckoutSession.payment_intent, deliveryAddress: completedCheckoutSession.customer_details.address, updatedAt: Date.now() },
                    { new: true }
                )
                    .populate("creator", "username email avatar")
                    .populate("winningBid", "bidAmount");

                const winner = await BidderModel.findByIdAndUpdate(auction?.winner, { address: completedCheckoutSession.customer_details.address, updatedAt: Date.now() }, { new: true });

                const creator: any = auction?.creator;

                const winningBid: any = auction?.winningBid;

                // calculate the delivery fee
                const deliveryFee = calculateDeliveryFee(auction?.shipType as ShipType, auction?.destination as Destination);

                // Mail the winner that the payment is completed successfully
                await mailService.sendPaymentCompleteMailToBidder({
                    bidder: { name: winner?.name as string, email: winner?.email as string },
                    auction: { photo: auction?.photo as string, title: auction?.title as string, creator: creator.username },
                    bidAmount: winningBid?.bidAmount,
                    social: auction?.social as {
                        platform: string;
                        platformId: string;
                    },
                    winnerMessage: auction?.winnerMessage as string,
                    winnerExtraMessage: auction?.winnerExtraMessage as string,
                    orderNo: auction?.orderNo as string,
                    deliveryFee: deliveryFee,
                    avatar: creator.avatar,
                });

                // Mail the creator that the payment is completed successfully
                await mailService.sendPaymentReceivedMailToCreator({
                    creator: { name: creator.username, email: creator.email },
                    photo: String(auction?.photo),
                    bidderName: winner?.name as string,
                    wonAmount: winningBid?.bidAmount,
                    address: winner?.address as Address,
                    deliveryFee: deliveryFee,
                });

                // cancel all the jobs of the current auction
                await SchedulerService.cancelSchedulers(auction?._id, creator?.username as string);

                break;
            }
            default:
                console.log(`Unhandled event type ${event.type}`);
        }
    }

    async getCurrencies() {
        return currencies;
    }

    async getSession({ body }: Partial<Request>) {
        const { error, value: data } = Joi.object({
            body: Joi.object({
                sessionId: Joi.string().required(),
            }),
        })
            .options({ stripUnknown: true })
            .validate({ body });

        if (error) throw new CustomError(error.message, 400);

        const session = await stripe.checkout.sessions.retrieve(data.body.sessionId);
        return session;
    }
}

export default new StripeService();
