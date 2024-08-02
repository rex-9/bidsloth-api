import { Request } from "express";
import { CONFIGS } from "@/configs";
import Joi from "joi";
import JWT from "jsonwebtoken";
import CustomError from "@/utilities/custom-error";
import mailService from "@/services/mail.service";

import CreatorModel from "@/models/creator.model";
import AuctionModel from "@/models/auction.model";
import BidModel from "@/models/bid.model";
import BidderModel from "@/models/bidder.model";
import TokenModel from "@/models/token.model";
import mongoose from "mongoose";
import { calculateRemainingTime, insideDateTime } from "@/utilities/helpers";
import { io } from "..";
import { ErrorMessage, socketEvents } from "@/utilities/constants";

interface BidBody {
    auctionId: mongoose.Schema.Types.ObjectId;
    name: string;
    email: string;
    bidAmount: number;
    comment?: string;
}

class BidService {
    async index({ body }: Partial<Request>) {
        const { error, value: data } = Joi.object({
            body: Joi.object({
                auctionId: Joi.string().required(),
            }),
        })
            .options({ stripUnknown: true })
            .validate({ body });

        if (error) throw new CustomError(error.message, 400);

        const bids = await BidModel.find({ auction: data.body.auctionId }).populate("auction", "title").populate("bidder", "name email").sort({ bidAmount: -1 });

        return bids;
    }

    async validateOrCreate({ body }: Partial<Request>) {
        const { error, value: data } = Joi.object({
            body: Joi.object({
                auctionId: Joi.string().required(),
                bidAmount: Joi.number().required(),
                name: Joi.string().required(),
                email: Joi.string()
                    .email({
                        minDomainSegments: 2,
                        tlds: { allow: false },
                    })
                    .lowercase()
                    .required(),
                comment: Joi.string().optional(),
            }),
        })
            .options({ stripUnknown: true })
            .validate({ body });

        if (error) throw new CustomError(error.message, 400);

        const auction = await AuctionModel.findOne({ _id: data.body.auctionId });

        // Check if auction exists
        if (!auction) throw new CustomError(ErrorMessage.auction_not_found, 400);

        // Check if auction is expired
        if (!insideDateTime(auction?.startDateTime as unknown as string, auction?.endDateTime as unknown as string)) throw new CustomError(ErrorMessage.outside_of_auction_time, 400);

        // Validate the bid amount
        const startPrice = auction?.startPrice as number;
        const increment = auction?.bidIncrement as number;

        // Get the Top Bid of the current Auction
        const topBid = await BidModel.findOne({ auction: data.body.auctionId }).sort({ bidAmount: -1 });
        // Check if auction exists
        if (!auction) throw new CustomError(ErrorMessage.auction_not_found, 400);

        if (!topBid) {
            // If there is no bid yet, throw error when Bid amount is lower than the Start Price
            if (!startPrice || data.body.bidAmount < startPrice) throw new CustomError(ErrorMessage.bid_gt_start_price, 400);
        } else {
            // If there are bids, throw error when Bid amount is lower than TopBid amount + Bid Increment
            if (!increment || data.body.bidAmount < topBid.bidAmount + increment) throw new CustomError(ErrorMessage.bid_gt_top_amount, 400);
        }

        // Prevent bidding their own auctions
        const creator = await CreatorModel.findOne({ _id: auction.creator });
        if (!creator) throw new CustomError(ErrorMessage.creator_not_found, 400);
        if (creator.email === data.body.email) throw new CustomError(ErrorMessage.bid_own_auction, 400);

        // Prevent top bidders from bidding again
        const currentHighestBid = await BidModel.findOne({ auction: auction._id, isTopBid: true });
        if (currentHighestBid) {
            const currentHighestBidder = await BidderModel.findOne({ _id: currentHighestBid.bidder });
            if (currentHighestBidder?.email === data.body.email) throw new CustomError(ErrorMessage.bid_top_bidder, 400);
        }

        if (!topBid) {
            // If there is no bid yet, throw error when Bid amount is lower than the Start Price
            if (!startPrice || data.body.bidAmount < startPrice) throw new CustomError(ErrorMessage.bid_gt_start_price, 400);
        } else {
            // If there are bids, throw error when Bid amount is lower than TopBid amount + Bid Increment
            if (!increment || data.body.bidAmount < topBid.bidAmount + increment) throw new CustomError(ErrorMessage.bid_gt_top_amount, 400);
        }

        // Check if the Email of Bidder already exists in our Database
        const bidder = await BidderModel.findOne({ email: data.body.email });

        const req = {
            body: {
                bidder: {
                    name: data.body.name,
                    email: data.body.email,
                },
            },
        };

        // If the Bidder doesn't exist, send verification email
        if (!bidder) return this.requestBidderVerification({ ...req });

        // Generate JWT token
        const token = JWT.sign({ _id: bidder._id, email: bidder.email }, CONFIGS.JWT_SECRET, { expiresIn: CONFIGS.JWT_EXPIRES_IN });

        // If the Bidder exists and pass the bid validation create a new Bid;
        await this.create(data.body);

        return token;
    }

    async verifyAndCreate({ body }: Partial<Request>) {
        const { error, value: data } = Joi.object({
            body: Joi.object({
                verificationCode: Joi.string().required(),
                auctionId: Joi.string().required(),
                bidAmount: Joi.number().required(),
                name: Joi.string().required(),
                email: Joi.string()
                    .email({
                        minDomainSegments: 2,
                        tlds: { allow: false },
                    })
                    .lowercase()
                    .required(),
                comment: Joi.string().optional(),
            }),
        })
            .options({ stripUnknown: true })
            .validate({ body });

        if (error) throw new CustomError(error.message, 400);

        // if verificationCode, check if code is valid
        const validTokenCode = await TokenModel.findOne({ code: data.body.verificationCode, bidderEmail: data.body.email });

        if (!validTokenCode) throw new CustomError(ErrorMessage.bidder_email_verify_failed, 400);

        // if token valid, save token and create bid
        const token = validTokenCode.token;

        // Check if auction exists
        const auction = await AuctionModel.findOne({ _id: data.body.auctionId });
        if (!auction) throw new CustomError(ErrorMessage.auction_not_found, 400);

        // Check if auction is expired
        if (!insideDateTime(auction?.startDateTime as unknown as string, auction?.endDateTime as unknown as string)) throw new CustomError(ErrorMessage.auction_expired, 400);

        // Validate the bid amount
        const increment = auction?.bidIncrement;
        const startPrice = auction?.startPrice;

        // Get the Top Bid of the current Auction
        const topBid = await BidModel.findOne({ auction: data.body.auctionId }).sort({ bidAmount: -1 });

        if (!topBid) {
            // If there is no bid yet, throw error when Bid amount is lower than the Start Price
            if (!startPrice || data.body.bidAmount < startPrice) throw new CustomError(ErrorMessage.bid_gt_start_price, 400);
        } else {
            // If there are bids, throw error when Bid amount is lower than TopBid amount + Bid Increment
            if (!increment || data.body.bidAmount < topBid.bidAmount + increment) throw new CustomError(ErrorMessage.bid_gt_top_amount, 400);
        }

        const bid = await this.create(data.body);

        // Delete token
        await TokenModel.deleteOne({ _id: validTokenCode._id });

        return { bid, token };
    }

    async requestBidderVerification({ body }: Partial<Request>) {
        const { error, value: data } = Joi.object({
            body: Joi.object({
                bidder: Joi.object({
                    name: Joi.string().required(),
                    email: Joi.string()
                        .email({
                            minDomainSegments: 2,
                            tlds: { allow: false },
                        })
                        .lowercase()
                        .required(),
                }),
            }),
        })
            .options({ stripUnknown: true })
            .validate({ body });

        if (error) throw new CustomError(error.message, 400);

        // Create a new Token using the email of the bidder
        const verificationToken = await new TokenModel({ bidderEmail: data.body.bidder.email }).save();

        // Send mail along with the verification token
        await mailService.sendVerificationCodeMailToBidder({ bidder: data.body.bidder, verificationCode: verificationToken.code });

        return verificationToken;
    }

    async create(body: BidBody) {
        // Check if the Email of Bidder already exists in our Database
        let bidder = await BidderModel.findOne({ email: body.email });

        if (!bidder) {
            // If Bidder not found, Create a new Bidder
            bidder = await new BidderModel({ name: body.name, email: body.email }).save();
        } else {
            // If Bidder found, Update it.
            bidder = await BidderModel.findOneAndUpdate({ email: body.email }, { name: body.name, updatedAt: Date.now() }, { new: true });
        }

        // Get the Top Bid of the current Auction
        const topBid = await BidModel.findOne({ auction: body.auctionId }).sort({ bidAmount: -1 });

        if (topBid) {
            // Get the Top Bidder of the current Auction
            const topBidder = await BidderModel.findOne({ _id: topBid.bidder });
            if (!topBidder) throw new CustomError(ErrorMessage.top_bidder_not_found, 400);

            const auction = await AuctionModel.findById(body.auctionId).populate("creator", "username email avatar");
            if (!auction) throw new CustomError(ErrorMessage.auction_not_found, 400);

            const creator: any = auction.creator;
            if (!creator) throw new CustomError(ErrorMessage.creator_not_found, 400);

            // calculate the remaining time for the auction to end
            const remainingTimeToEnd = calculateRemainingTime(auction?.endDateTime);

            // Mail him that he has been Outbidded
            await mailService.sendOutbiddedMailToBidder({
                bidder: { name: topBidder.name, email: topBidder.email },
                auction: { photo: auction?.photo as string, title: auction?.title as string, creator: creator.username },
                bidAmount: body.bidAmount,
                countDown: remainingTimeToEnd,
                auctionLink: `${CONFIGS.URL.LANDING_BASE_URL}/${creator.username}`,
                avatar: creator.avatar,
            });

            // Mark all bids in this auction as outbidded
            await BidModel.updateMany({ auction: body.auctionId }, { $set: { isTopBid: false, updatedAt: Date.now() } }, { multi: true });
        }

        const oldBids = await BidModel.find({ auction: body.auctionId }).populate("bidder", "email");

        // Create a new Bid
        const bid = await new BidModel({ auction: body.auctionId, bidder: bidder?._id, bidAmount: body.bidAmount, comment: body.comment }).save();
        if (!bid) throw new CustomError(ErrorMessage.bidding_failed, 400);

        // Update the auction with the new attributes
        const auction = await AuctionModel.findOneAndUpdate({ _id: body.auctionId }, { winningBid: bid, winner: bidder, $inc: { bidCount: 1, commentCount: body.comment ? 1 : 0 } }).populate("creator", "username email avatar");
        if (!auction) throw new CustomError(ErrorMessage.auction_update_failed, 400);

        const creator: any = auction.creator;
        if (!creator) throw new CustomError(ErrorMessage.creator_not_found, 400);

        let isExistingBidder = false;

        if (oldBids.length > 0) {
            oldBids.forEach((bid) => {
                const bidBidder: any = bid.bidder;
                if (bidBidder.email === bidder?.email) isExistingBidder = true;
            });
        }

        // calculate the remaining time for the auction to end
        const remainingTimeToEnd = calculateRemainingTime(auction?.endDateTime);
        console.log("oldBids", oldBids);
        // Mail the bidder that a bid is placed successfully
        if (isExistingBidder) {
            console.log("Again", isExistingBidder);
            await mailService.sendBidPlacedAgainMailToBidder({
                bidder: { name: bidder?.name as string, email: bidder?.email as string },
                auction: { photo: auction?.photo as string, title: auction?.title as string, creator: creator.username },
                bidAmount: bid.bidAmount,
                countDown: remainingTimeToEnd,
                avatar: creator.avatar,
            });
        } else {
            console.log("First", isExistingBidder);
            await mailService.sendBidPlacedMailToBidder({
                bidder: { name: bidder?.name as string, email: bidder?.email as string },
                auction: { photo: auction?.photo as string, title: auction?.title as string, creator: creator.username },
                bidAmount: bid.bidAmount,
                countDown: remainingTimeToEnd,
                auctionLink: `${CONFIGS.URL.LANDING_BASE_URL}/${creator.username}`,
                thankMessage: auction?.bidderMessage as string,
                avatar: creator.avatar,
            });
        }

        // Mail the creator if there is a comment in the bid
        if (body.comment) {
            await mailService.sendCommentNotiMailToCreator({ creator: { name: creator.username, email: creator.email }, comment: body.comment, link: `${CONFIGS.URL.LANDING_BASE_URL}/${creator.username}` });
        }

        // return object for bid socket bid event
        const bidSocket = {
            bidder: bidder?.name,
            amount: bid.bidAmount,
            comment: bid.comment,
        };

        // socket.io
        io.emit(socketEvents.bid, bidSocket);

        return bid;
    }
}

export default new BidService();
