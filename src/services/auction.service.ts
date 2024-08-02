import Joi from "joi";
import { Request } from "express";

import AuctionModel from "@/models/auction.model";
import CreatorModel from "@/models/creator.model";
import BidModel from "@/models/bid.model";
import CustomError from "@/utilities/custom-error";
import { Destination, ErrorMessage, PlatformType, SchedulerType, ShipType, currencies, socketEvents } from "@/utilities/constants";
import { uploadToCloudinary } from "@/utilities/cloudinary";
import { calculateDeliveryFee, calculateRemainingTime } from "@/utilities/helpers";
import { io } from "..";
import SchedulerModel from "@/models/scheduler.model";
import SchedulerService from "./scheduler.service";

class AuctionService {
    async index({ $currentUser }: Partial<Request>) {
        const { error, value: data } = Joi.object({
            $currentUser: Joi.object({
                _id: Joi.required(),
            }),
        })
            .options({ stripUnknown: true })
            .validate({ $currentUser });

        if (error) throw new CustomError(error.message, 400);

        // Fetch completed auctions
        const auctions = await AuctionModel.find({ creator: data.$currentUser._id, isDraft: false }).sort({ createdAt: -1 });

        return auctions;
    }

    async history({ $currentUser }: Partial<Request>) {
        const { error, value: data } = Joi.object({
            $currentUser: Joi.object({
                _id: Joi.required(),
            }),
        })
            .options({ stripUnknown: true })
            .validate({ $currentUser });

        if (error) throw new CustomError(error.message, 400);

        // Fetch auction histories
        const auctions = await AuctionModel.find({ creator: data.$currentUser._id, ended: true }).sort({ createdAt: -1 });

        return auctions;
    }

    async deliverPrize({ body }: Partial<Request>) {
        const { error, value: data } = Joi.object({
            body: Joi.object({
                auctionId: Joi.required(),
            }),
        })
            .options({ stripUnknown: true })
            .validate({ body });
        if (error) throw new CustomError(error.message, 400);

        // check if the auction exists with the winner
        const auction = await AuctionModel.findById(data.body.auctionId).populate("winner", "name email").populate("creator", "avatar");
        if (!auction) throw new CustomError(ErrorMessage.auction_not_found, 400);

        const creator: any = auction.creator;

        // check if the prize is delivered
        if (auction.isPrizeDelivered) throw new CustomError(ErrorMessage.prize_already_delivered, 400);

        // check if the auction is still in progress
        const remainingTimeToEnd = calculateRemainingTime(auction.endDateTime);
        if (remainingTimeToEnd !== 0) throw new CustomError(ErrorMessage.auction_ongoing, 400);

        // Create a new Date object for the current date
        const currentDate = new Date();

        // Get the current day of the month
        const currentDay = currentDate.getDate();

        // Add 2 days to the current day
        const twoDaysLater = currentDay + 2;

        // Add 7 days to the current day
        const sevenDaysLater = currentDay + 7;

        // save the prize received scheduler
        const prizeDeliveredSchedule = await new SchedulerModel({
            name: `${SchedulerType.PRIZE_DELIVERED}-${auction?._id}`,
            runAt: twoDaysLater,
            type: SchedulerType.PRIZE_DELIVERED,
            auction: auction?._id,
            creator: creator?._id,
        }).save();

        // schedule the prize delivered confirmation mail for two days later
        SchedulerService.prizeDelivered(prizeDeliveredSchedule);

        // save the payout execute scheduler
        const payoutExecuteSchedule = await new SchedulerModel({
            name: `${SchedulerType.PAYOUT_EXECUTE}-${auction?._id}`,
            runAt: sevenDaysLater,
            type: SchedulerType.PAYOUT_EXECUTE,
            auction: auction?._id,
            creator: creator?._id,
        }).save();

        // schedule the payout execute mail for seven days later
        SchedulerService.payoutExecute(payoutExecuteSchedule);

        // deliver prize to the auction and mark the auction as ended
        const deliveredAuction = await AuctionModel.findByIdAndUpdate(data.body.auctionId, { isPrizeDelivered: true, ended: true, updatedAt: Date.now() }, { new: true });
        if (!deliveredAuction) throw new CustomError(ErrorMessage.prize_deliver_failed, 400);

        return deliveredAuction;
    }

    async draft({ $currentUser }: Partial<Request>) {
        const { error, value: data } = Joi.object({
            $currentUser: Joi.object({
                _id: Joi.required(),
            }),
        })
            .options({ stripUnknown: true })
            .validate({ $currentUser });

        if (error) throw new CustomError(error.message, 400);

        const auction = await AuctionModel.findOne({ creator: data.$currentUser._id, isDraft: true });

        return auction;
    }

    async detail({ body }: Partial<Request>) {
        const { error, value: data } = Joi.object({
            body: Joi.object({
                auctionId: Joi.string().required(),
            }),
        })
            .options({ stripUnknown: true })
            .validate({ body });

        if (error) throw new CustomError(error.message, 400);

        const auction = await AuctionModel.findOne({ _id: data.body.auctionId });
        if (!auction) throw new CustomError(ErrorMessage.auction_not_found, 404);

        return auction;
    }

    async live(username: string | undefined) {
        if (!username) throw new CustomError(ErrorMessage.need_username, 400);

        const creator = await CreatorModel.findOne({ username: username });
        if (!creator) throw new CustomError(ErrorMessage.creator_not_found, 400);

        // const currentDate = new Date();

        // get the live auction
        // const auction = await AuctionModel.findOne({ creator: creator._id, startDateTime: { $lte: currentDate.toISOString() }, endDateTime: { $gte: currentDate.toISOString() }}).populate('creator', 'username');

        const auction = await AuctionModel.findOne({ creator: creator._id, isDraft: false }).populate("creator", "username avatar").sort({ createdAt: -1 });

        if (!auction) throw new CustomError(ErrorMessage.live_auction_not_found, 400);

        // calculate the remaining days of the auction
        const remainingTimeToStart = calculateRemainingTime(auction.startDateTime);
        const remainingTimeToEnd = calculateRemainingTime(auction.endDateTime);

        const bids = await BidModel.find({ auction: auction._id }).populate("bidder", "name email").populate("reply", "content").sort({ createdAt: -1 });

        auction.bids = bids;

        return {
            remainingTimeToStart,
            remainingTimeToEnd,
            auction,
        };
    }

    async create({ body, $currentUser }: Partial<Request>) {
        const { error, value: data } = Joi.object({
            body: Joi.object({
                charityId: Joi.string().optional(),
                title: Joi.string().optional(),
                description: Joi.string().optional(),
                color: Joi.string().optional(),
                photo: Joi.string().optional(),
                video: Joi.string().optional(),
                startDateTime: Joi.date().optional(),
                endDateTime: Joi.date().optional(),
                currency: Joi.string()
                    .valid(...currencies.map((currency) => currency.value))
                    .optional(),
                startPrice: Joi.number().optional(),
                bidIncrement: Joi.number().optional(),
                shipType: Joi.string().valid(ShipType.WORLDWIDE, ShipType.COUNTRY, ShipType.EVENT, ShipType.DIGITAL).optional(),
                destination: Joi.object({
                    location: Joi.string().optional(),
                    deliveryFee: Joi.number().optional(),
                }).optional(),
                prizeDate: Joi.object({
                    month: Joi.number().optional(),
                    year: Joi.number().optional(),
                }).optional(),
                bidderMessage: Joi.string().optional(),
                winnerMessage: Joi.string().optional(),
                winnerExtraMessage: Joi.string().optional(),
                social: Joi.object({
                    platform: Joi.string().valid(PlatformType.EMAIL, PlatformType.INSTAGRAM, PlatformType.WHATSAPP, PlatformType.MESSENGER, PlatformType.SNAPCHAT, PlatformType.TWITTER, PlatformType.NONE).optional(),
                    platformId: Joi.string().optional(),
                }).optional(),
            }),
            $currentUser: Joi.object({
                _id: Joi.required(),
            }),
        })
            .options({ stripUnknown: true })
            .validate({ body, $currentUser });

        if (error) throw new CustomError(error.message, 400);

        // find the latest auction
        const latestAuction = await AuctionModel.findOne({ creator: data.$currentUser._id }).sort({ createdAt: -1 });

        // if latest non-draft auction exists and still not expired when creating new auction
        if (latestAuction && !latestAuction.ended && !latestAuction.isDraft) throw new CustomError(ErrorMessage.latest_auction_not_complete, 400);

        // Generate a random 6-digit orderNo
        const randomOrderNo = Math.floor(100000 + Math.random() * 900000).toString();
        data.body.orderNo = randomOrderNo;

        const { video, photo, ...rest } = data.body;

        // Create new auction with the rest of data except from video and photo
        let auction: any = await new AuctionModel({ creator: data.$currentUser._id, ...rest }).save();

        if (photo) {
            // Image Upload to cloudinary
            const result = await uploadToCloudinary("image", "png", data.body.photo, "bidsloth_auctions", `photo-${auction._id}`);

            data.body.photo = result.secure_url;
        }

        if (video) {
            // Video Upload to cloudinary
            const result = await uploadToCloudinary("video", "mp4", data.body.video, "bidsloth_auctions", `video-${auction._id}`);

            data.body.video = result.secure_url;
        }

        // Find and Update the auction with video and photo if available
        auction = await AuctionModel.findOneAndUpdate({ _id: auction._id }, { $set: { ...data.body, updatedAt: Date.now() } }, { new: true });

        return auction;
    }

    async deleteDraft({ body, $currentUser }: Partial<Request>) {
        const { error, value: data } = Joi.object({
            body: Joi.object({
                auctionId: Joi.string().required(),
            }),
            $currentUser: Joi.object({
                _id: Joi.required(),
            }),
        })
            .options({ stripUnknown: true })
            .validate({ body, $currentUser });

        if (error) throw new CustomError(error.message, 400);

        const draft = await AuctionModel.findOneAndDelete({ _id: data.body.auctionId, creator: data.$currentUser._id, isDraft: true });
        if (!draft) throw new CustomError(ErrorMessage.draft_not_found, 400);

        return;
    }

    async update({ body, $currentUser }: Partial<Request>) {
        const { error, value: data } = Joi.object({
            body: Joi.object({
                auctionId: Joi.string(),
                charityId: Joi.string().optional(),
                title: Joi.string().optional(),
                description: Joi.string().optional(),
                color: Joi.string().optional(),
                photo: Joi.string().optional(),
                video: Joi.string().optional(),
                startDateTime: Joi.date().optional(),
                endDateTime: Joi.date().optional(),
                currency: Joi.string()
                    .valid(...currencies.map((currency) => currency.value))
                    .optional(),
                startPrice: Joi.number().optional(),
                bidIncrement: Joi.number().optional(),
                shipType: Joi.string().valid(ShipType.WORLDWIDE, ShipType.COUNTRY, ShipType.EVENT, ShipType.DIGITAL).optional(),
                destination: Joi.object({
                    location: Joi.string().optional(),
                    deliveryFee: Joi.number().optional(),
                }).optional(),
                prizeDate: Joi.object({
                    month: Joi.number().optional(),
                    year: Joi.number().optional(),
                }).optional(),
                bidderMessage: Joi.string().optional(),
                winnerMessage: Joi.string().optional(),
                winnerExtraMessage: Joi.string().optional(),
                social: Joi.object({
                    platform: Joi.string().valid(PlatformType.EMAIL, PlatformType.INSTAGRAM, PlatformType.WHATSAPP, PlatformType.MESSENGER, PlatformType.SNAPCHAT, PlatformType.TWITTER, PlatformType.NONE).optional(),
                    platformId: Joi.string().optional(),
                }).optional(),
            }),
            $currentUser: Joi.object({
                _id: Joi.required(),
            }),
        })
            .options({ stripUnknown: true })
            .validate({ body, $currentUser });

        if (error) throw new CustomError(error.message, 400);

        // find existing auction
        const auctionId = data.body.auctionId;

        let auction = await AuctionModel.findById(auctionId);

        if (!auction) throw new CustomError(ErrorMessage.auction_not_found, 400);

        if (data.body.photo) {
            // Image Upload to cloudinary
            const result = await uploadToCloudinary("image", "png", data.body.photo, "bidsloth_auctions", `photo-${auctionId}`);

            data.body.photo = result.secure_url;
        }

        if (data.body.video) {
            // Video Upload to cloudinary
            const result = await uploadToCloudinary("video", "mp4", data.body.video, "bidsloth_auctions", `video-${auctionId}`);

            data.body.video = result.secure_url;
        }

        delete data.body.auctionId;

        // Find and Update the auction
        await AuctionModel.findOneAndUpdate({ _id: auctionId }, { $set: { ...data.body, updatedAt: Date.now() } }, { new: true });

        auction = await AuctionModel.findById(auctionId);

        return auction;
    }

    async launch({ body, $currentUser }: Partial<Request>) {
        const { error, value: data } = Joi.object({
            body: Joi.object({
                auctionId: Joi.string().optional(),
                charityId: Joi.string().optional(),
                idea: Joi.string().optional(),
                title: Joi.string().required(),
                description: Joi.string().required(),
                color: Joi.string().required(),
                photo: Joi.string().required(),
                video: Joi.string().optional(),
                startDateTime: Joi.date().required(),
                endDateTime: Joi.date().required(),
                currency: Joi.string()
                    .valid(...currencies.map((currency) => currency.value))
                    .required(),
                startPrice: Joi.number().required(),
                bidIncrement: Joi.number().required(),
                shipType: Joi.string().valid(ShipType.WORLDWIDE, ShipType.COUNTRY, ShipType.EVENT, ShipType.DIGITAL).required(),
                destination: Joi.object({
                    location: Joi.string().required(),
                    deliveryFee: Joi.number().required(),
                }).required(),
                prizeDate: Joi.object({
                    month: Joi.number().required(),
                    year: Joi.number().required(),
                }).required(),
                bidderMessage: Joi.string().required(),
                winnerMessage: Joi.string().required(),
                winnerExtraMessage: Joi.string().required(),
                social: Joi.object({
                    platform: Joi.string().valid(PlatformType.EMAIL, PlatformType.INSTAGRAM, PlatformType.WHATSAPP, PlatformType.MESSENGER, PlatformType.SNAPCHAT, PlatformType.TWITTER, PlatformType.NONE).required(),
                    platformId: Joi.string().required(),
                }).required(),
                successUrl: Joi.string().required(),
                cancelUrl: Joi.string().required(),
            }),
            $currentUser: Joi.object({
                _id: Joi.required(),
            }),
        })
            .options({ stripUnknown: true })
            .validate({ body, $currentUser });

        if (error) throw new CustomError(error.message, 400);

        // start date and end date must be future dates
        const startDate = new Date(data.body.startDateTime);
        const endDate = new Date(data.body.endDateTime);
        const currentDate = new Date();
        // console.log('Start Date: ', startDate);
        // console.log('End Date: ', endDate);
        // console.log('Current Date: ', currentDate);
        if (!(startDate > currentDate && endDate > startDate)) throw new CustomError(ErrorMessage.past_dates, 400);

        // find the creator
        const creator = await CreatorModel.findById(data.$currentUser._id);
        if (!creator) throw new CustomError(ErrorMessage.creator_not_found, 400);

        // check if creator has avatar uploaded
        if (!creator.avatar) throw new CustomError(ErrorMessage.avatar_not_uploaded, 400);

        // check if creator is connected to stripe
        if (!creator.isStripeConnected) throw new CustomError(ErrorMessage.stripe_not_fully_connected, 400);

        let auction: any;

        if (data.body.auctionId) { // if there is draft 
            // find the auction
            auction = await AuctionModel.findById(data.body.auctionId).populate("creator");
            if (!auction) throw new CustomError(ErrorMessage.auction_not_found, 400);
        } else {
            // find the latest auction
            const latestAuction = await AuctionModel.findOne({ creator: data.$currentUser._id }).sort({ createdAt: -1 });

            // if latest auction exists and still not expired when creating new auction
            if (latestAuction && !latestAuction.ended) throw new CustomError(ErrorMessage.latest_auction_not_complete, 400);

            // Generate a random 6-digit orderNo
            const randomOrderNo = Math.floor(100000 + Math.random() * 900000).toString();
            data.body.orderNo = randomOrderNo;

            // Create new auction
            const newAuction = await new AuctionModel({ creator: data.$currentUser._id, ...data.body }).save();
            auction = await AuctionModel.findById(newAuction._id).populate("creator");
            if (!auction) throw new CustomError(ErrorMessage.auction_creation_failed, 400);
        }

        if (data.body.photo) {
            // Image Upload to cloudinary
            const result = await uploadToCloudinary("image", "png", data.body.photo, "bidsloth_auctions", `photo-${auction._id}`);

            data.body.photo = result.secure_url;
        }

        if (data.body.video) {
            // Video Upload to cloudinary
            const result = await uploadToCloudinary("video", "mp4", data.body.video, "bidsloth_auctions", `video-${auction._id}`);

            data.body.video = result.secure_url;
        }

        // Mark this auction as complete updating with the new values
        auction = await AuctionModel.findOneAndUpdate({ _id: auction._id }, { $set: { ...data.body, isDraft: false, updatedAt: Date.now() } }, { new: true });

        if (!auction) throw new CustomError(ErrorMessage.launch_auction_failed, 400);

        // get updated auction
        auction = await AuctionModel.findById(data.body.auctionId);

        // calculate the delivery fee
        const deliveryFee = calculateDeliveryFee(auction?.shipType as ShipType, auction?.destination as Destination);

        // save the auction starts scheduler
        const startSchedule = await new SchedulerModel({
            name: `${SchedulerType.AUCTION_STARTS}-${auction?._id}`,
            runAt: auction?.startDateTime,
            type: SchedulerType.AUCTION_STARTS,
            auction: auction?._id,
            creator: creator?._id,
        }).save();

        // save the auction daily update scheduler
        await new SchedulerModel({
            name: `${SchedulerType.DAILY_UPDATE}-${creator?.username}`,
            // cron: `${startDate.getSeconds()} */1 * * * *`, // run every 1 min <--- test locally
            // cron: `${startDate.getSeconds()} */15 * * * *`, // run every 15 min <--- test locally
            cron: `${startDate.getSeconds()} ${startDate.getMinutes()} ${startDate.getHours()} * * *`, // run every 24 hours
            type: SchedulerType.DAILY_UPDATE,
            auction: auction?._id,
            creator: creator?._id,
        }).save();

        // start the auction start scheduler
        await SchedulerService.auctionStarts(startSchedule);

        // console.log(`Auction Starts Scheduled at ${startDate}!`);

        // save the auction ends scheduler
        const endSchedule = await new SchedulerModel({
            name: `${SchedulerType.AUCTION_ENDS}-${auction?._id}`,
            runAt: auction?.endDateTime,
            type: SchedulerType.AUCTION_ENDS,
            auction: auction?._id,
            creator: creator?._id,
            successUrl: data.body.successUrl,
            cancelUrl: data.body.cancelUrl,
        }).save();

        // save the generate checkout url scheduler
        await new SchedulerModel({
            name: `${SchedulerType.GENERATE_CHECKOUT_URL}-${creator?.username}`,
            // cron: `${endDate.getSeconds()} */1 * * * *`, // run every 1 min <--- test locally
            cron: `${auction?.endDateTime.getSeconds()} ${auction?.endDateTime.getMinutes()} */23 * * *`, // run every 23 hours
            type: SchedulerType.GENERATE_CHECKOUT_URL,
            auction: auction?._id,
            creator: creator?._id,
            successUrl: data.body.successUrl,
            cancelUrl: data.body.cancelUrl,
        }).save();

        // save the move to next bidder scheduler
        await new SchedulerModel({
            name: `${SchedulerType.MOVE_TO_NEXT_BIDDER}-${creator?.username}`,
            // cron: `${startDate.getSeconds()} */5 * * * *`, // run every 5 mins <--- test locally
            cron: `${startDate.getSeconds()} ${startDate.getMinutes()} ${startDate.getHours()} */2 * *`, // run every 48 hours
            type: SchedulerType.MOVE_TO_NEXT_BIDDER,
            currentBidIndex: 1,
            deliveryFee: deliveryFee,
            auction: auction?._id,
            creator: creator?._id,
        }).save();

        // start the auction end scheduler
        await SchedulerService.auctionEnds(endSchedule);

        // console.log(`Auction Ends Scheduled at ${endDate}!`);

        return auction;
    }

    async love({ body }: Partial<Request>, isLoved: boolean) {
        const { error, value: data } = Joi.object({
            body: Joi.object({
                auctionId: Joi.string().required(),
            }),
        })
            .options({ stripUnknown: true })
            .validate({ body });

        if (error) throw new CustomError(error.message, 400);

        // find the auction
        const auction = await AuctionModel.findById(data.body.auctionId);
        if (!auction) throw new CustomError(ErrorMessage.auction_not_found, 400);

        if (!auction.loves) auction.loves = 0;

        let updatedLoves = 0;

        // condition to be loved or unloved
        if (isLoved) {
            updatedLoves = auction.loves + 1;
        } else {
            if (auction.loves > 0) {
                // console.log("love is greater than 0");
                updatedLoves = auction.loves - 1;
            } else {
                updatedLoves = 0;
            }
        }

        // love or unlove the auction
        await AuctionModel.findOneAndUpdate({ _id: data.body.auctionId }, { loves: updatedLoves, updatedAt: Date.now() }, { new: true });

        // socket.io
        // io.on('connection', (socket) => {
        //   console.log('connected with the client: ', socket.id);
        // to all connected clients
        io.emit(
            socketEvents.loves,
            updatedLoves
            // {
            //   loves: updatedLoves,
            // }
        );
        // });

        return {
            loves: updatedLoves,
        };
    }
}

export default new AuctionService();
