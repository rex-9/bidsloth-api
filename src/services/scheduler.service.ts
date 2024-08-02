import cron from "node-schedule";
import CustomError from "@/utilities/custom-error";
import SchedulerModel, { IScheduler } from "@/models/scheduler.model";
import AuctionModel from "@/models/auction.model";
import CreatorModel from "@/models/creator.model";
import BidderModel from "@/models/bidder.model";
import BidModel from "@/models/bid.model";
import mailService from "./mail.service";
import { calculateDeliveryFee, calculateRemainingTime, cronPaymentReminderMails, getOrdinalSuffix } from "@/utilities/helpers";
import { CONFIGS } from "@/configs";
import StripeService from "./stripe.service";
import { Destination, ErrorMessage, SchedulerType, ShipType } from "@/utilities/constants";

class SchedulerService {
    async continue() {
        console.log("continue schedulers ===> ");
        const schedules = await SchedulerModel.find({});

        const helpSchedules = schedules.filter((schedule: any) => schedule.type === SchedulerType.HELP);

        const startSchedules = schedules.filter((schedule: any) => schedule.type === SchedulerType.AUCTION_STARTS);

        const endSchedules = schedules.filter((schedule: any) => schedule.type === SchedulerType.AUCTION_ENDS);

        const updateSchedules = schedules.filter((schedule: any) => schedule.type === SchedulerType.DAILY_UPDATE);

        const checkoutSchedules = schedules.filter((schedule: any) => schedule.type === SchedulerType.GENERATE_CHECKOUT_URL);

        const moveSchedules = schedules.filter((schedule: any) => schedule.type === SchedulerType.MOVE_TO_NEXT_BIDDER);

        const reminderSchedules = schedules.filter((schedule: any) => schedule.type === SchedulerType.REMINDER);

        const prizeDeliveredSchedules = schedules.filter((schedule: any) => schedule.type === SchedulerType.PRIZE_DELIVERED);

        const payoutExecuteSchedules = schedules.filter((schedule: any) => schedule.type === SchedulerType.PAYOUT_EXECUTE);

        helpSchedules.forEach(async (schedule: any) => {
            await this.helpMail(schedule);
        });

        startSchedules.forEach(async (schedule: any) => {
            await this.auctionStarts(schedule);
        });

        endSchedules.forEach(async (schedule: any) => {
            await this.auctionEnds(schedule);
        });

        updateSchedules.forEach(async (schedule: any) => {
            await this.dailyUpdate(schedule);
        });

        checkoutSchedules.forEach(async (schedule: any) => {
            await this.generateCheckoutUrl(schedule);
        });

        moveSchedules.forEach(async (schedule: any) => {
            await this.moveToNextBidder(schedule);
        });

        reminderSchedules.forEach(async (schedule: any) => {
            await this.paymentReminder(schedule);
        });

        prizeDeliveredSchedules.forEach(async (schedule: any) => {
            await this.prizeDelivered(schedule);
        });

        payoutExecuteSchedules.forEach(async (schedule: any) => {
            await this.payoutExecute(schedule);
        });
    }

    async helpMail(schedule: IScheduler) {
        const creator = await CreatorModel.findById(schedule.creator);
        // if (!creator) throw new CustomError(ErrorMessage.creator_not_found, 400);
        if (creator)
            // send help mail after 5 days
            cron.scheduleJob(schedule.name, schedule.runAt as Date, async () => {
                await mailService.sendHelpEmail({ user: creator });

                // delete help scheduler from database
                await SchedulerModel.findOneAndDelete({ name: schedule.name });
            });
    }

    async auctionStarts(schedule: IScheduler) {
        const auction = await AuctionModel.findById(schedule.auction);
        // if (!auction) throw new CustomError(ErrorMessage.auction_not_found, 400);
        const creator = await CreatorModel.findById(schedule.creator);
        // if (!creator) throw new CustomError(ErrorMessage.creator_not_found, 400);

        if (auction && creator)
            // when the auction starts
            cron.scheduleJob(schedule.name, schedule.runAt as Date, async () => {
                // mail the creator
                await mailService.sendAuctionStartsMailToCreator({ creator: { name: creator?.username as string, email: creator?.email as string, photo: auction?.photo as string }, title: auction?.title as string, auctionLink: `${CONFIGS.URL.LANDING_BASE_URL}/${creator?.username}` });

                // retrieve the daily update scheduler from the database
                const updateScheduler = await SchedulerModel.findOne({ name: `${SchedulerType.DAILY_UPDATE}-${creator?.username}` });
                // if (!updateScheduler) throw new CustomError(ErrorMessage.scheduler_not_found, 400);

                if (updateScheduler)
                    // schedule daily update schedulers
                    await this.dailyUpdate(updateScheduler);

                // console.log('ran AUCTION STARTS'); // test log
            });
        // console.log('scheduled AUCTION STARTS'); // test log
    }

    async dailyUpdate(schedule: IScheduler) {
        const auction = await AuctionModel.findById(schedule.auction);
        // if (!auction) throw new CustomError(ErrorMessage.auction_not_found, 400);

        const creator = await CreatorModel.findById(schedule.creator);
        // if (!creator) throw new CustomError(ErrorMessage.creator_not_found, 400);

        if (auction && creator)
            // Mail daily update to the creator
            cron.scheduleJob(
                schedule.name,
                { start: auction.startDateTime, end: auction.endDateTime, rule: schedule.cron as string }, // run every 24 hours starting from auction start date till auction end date
                async () => {
                    // get the daily bids of the current auction
                    const dailyBids = await BidModel.find({ auction: auction?._id }).sort({ bidAmount: -1 });

                    // count the number of comments in the daily bids
                    const commentCount = await BidModel.countDocuments({ comment: { $exists: true, $ne: null } });

                    // calculate the remaining time for the auction to end
                    const remainingTimeToEnd = calculateRemainingTime(auction?.endDateTime);

                    // send daily update mail to the creator
                    await mailService.sendDailyUpdateMailToCreator({
                        creator: { name: creator?.username as string, email: creator?.email as string },
                        auction: { photo: String(auction?.photo), topBid: dailyBids[0]?.bidAmount ?? 0, bidCount: dailyBids.length, commentCount: commentCount, countDown: remainingTimeToEnd },
                    });

                    // console.log('ran DAILY UPDATE'); // test log
                }
            );

        // console.log('scheduled DAILY UPDATE'); // test log
    }

    async auctionEnds(schedule: any) {
        let auction = await AuctionModel.findById(schedule.auction);
        // if (!auction) throw new CustomError(ErrorMessage.auction_not_found, 400);

        const creator = await CreatorModel.findById(schedule.creator);
        // if (!creator) throw new CustomError(ErrorMessage.creator_not_found, 400);

        if (auction && creator)
            // when the auction ends
            cron.scheduleJob(schedule.name, schedule.runAt as Date, async () => {
                // delete daily update scheduler
                await SchedulerModel.findOneAndDelete({ name: `${SchedulerType.DAILY_UPDATE}-${creator?.username}` });

                // stop mailing daily updates to the creator
                cron.cancelJob(`${SchedulerType.DAILY_UPDATE}-${creator?.username}`);

                // generate the checkout url
                const req = {
                    body: {
                        auctionId: auction?._id,
                        successUrl: schedule.successUrl,
                        cancelUrl: schedule.cancelUrl,
                    },
                };

                const checkoutUrl = await StripeService.generateCheckoutUrl({ ...req });

                // console.log('Checkout URL successfully generated!');

                if (!checkoutUrl) return;

                // get the updated auction
                auction = await AuctionModel.findById(auction?._id).populate("winner", "name email").populate("winningBid", "bidAmount");
                // if (!auction) throw new CustomError(ErrorMessage.auction_not_found, 400);

                if (auction) {
                    // calculate the delivery fee
                    const deliveryFee = calculateDeliveryFee(auction?.shipType as ShipType, auction?.destination as Destination);

                    const winner: any = auction?.winner;
                    const winningBid: any = auction?.winningBid;
                    // mail the creator
                    await mailService.sendAuctionEndsMailToCreator({ creator: { name: creator?.username as string, email: creator?.email as string }, bidderName: winner.name, wonAmount: winningBid.bidAmount, deliveryFee: deliveryFee });

                    // mail the winner
                    await mailService.sendBidderWonMailToBidder({
                        bidder: { name: winner.name, email: winner.email },
                        auction: { photo: auction?.photo as string, title: auction?.title as string, creator: creator?.username as string },
                        bidAmount: winningBid.bidAmount,
                        paymentLink: `${CONFIGS.URL.SERVER_BASE_URL}/stripe/checkout/${auction?._id}`,
                        deliveryFee: deliveryFee,
                        avatar: creator?.avatar as string,
                    });

                    // schedule payment reminder mails
                    cronPaymentReminderMails(
                        { _id: creator?._id, username: creator?.username as string, avatar: creator?.avatar as string },
                        { _id: winner._id, name: winner.name, email: winner.email },
                        { _id: auction?._id, endDateTime: auction?.endDateTime as Date, photo: auction?.photo as string, title: auction?.title as string, winnerMessage: auction?.winnerMessage as string, shipType: auction?.shipType as ShipType, destination: auction?.destination as Destination },
                        winningBid.bidAmount,
                        1
                    );

                    // retrieve the daily update scheduler from the database
                    const checkoutScheduler = await SchedulerModel.findOne({ name: `${SchedulerType.GENERATE_CHECKOUT_URL}-${creator?.username}` });
                    // if (!checkoutScheduler) throw new CustomError(ErrorMessage.scheduler_not_found, 400);

                    if (checkoutScheduler)
                        // generate a new checkout url every 23 hours
                        await this.generateCheckoutUrl(checkoutScheduler);

                    // retrieve the daily update scheduler from the database
                    const moveScheduler = await SchedulerModel.findOne({ name: `${SchedulerType.MOVE_TO_NEXT_BIDDER}-${creator?.username}` });

                    if (moveScheduler) {
                        if (!moveScheduler) throw new CustomError(ErrorMessage.scheduler_not_found, 400);

                        // move to the next bidder scheduler
                        await this.moveToNextBidder(moveScheduler);
                        // console.log('ran AUCTION ENDS'); // test log
                    }
                }
            });

        // console.log('scheduled AUCTION ENDS'); // test log
    }

    async generateCheckoutUrl(schedule: IScheduler) {
        const auction = await AuctionModel.findById(schedule.auction);
        // if (!auction) throw new CustomError(ErrorMessage.auction_not_found, 400);

        const creator = await CreatorModel.findById(schedule.creator);
        // if (!creator) throw new CustomError(ErrorMessage.creator_not_found, 400);

        const req = {
            body: {
                auctionId: auction?._id,
                successUrl: schedule.successUrl,
                cancelUrl: schedule.cancelUrl,
            },
        };

        if (auction && creator)
            cron.scheduleJob(
                schedule.name,
                { start: auction.endDateTime, rule: schedule.cron as string }, // run every 23 hours starting from auction end date
                async () => {
                    // unset the expired stripeSessionId in the auction document
                    await AuctionModel.updateOne({ _id: auction?._id }, { $unset: { stripeSessionId: 1 } });

                    // generate a new checkout url
                    await StripeService.generateCheckoutUrl({ ...req });
                    // console.log('ran GENERATE CHECKOUT URL'); // test log
                }
            );

        // console.log('scheduled GENERATE CHECKOUT URL'); // test log
    }

    async moveToNextBidder(schedule: IScheduler) {
        const auction = await AuctionModel.findById(schedule.auction);
        // if (!auction) throw new CustomError(ErrorMessage.auction_not_found, 400);

        const creator = await CreatorModel.findById(schedule.creator);
        // if (!creator) throw new CustomError(ErrorMessage.creator_not_found, 400);

        let currentBidIndex = schedule.currentBidIndex as number;

        if (auction && creator)
            cron.scheduleJob(
                schedule.name,
                { start: auction.endDateTime, rule: schedule.cron as string }, // run every 48 hours starting from auction end date
                async () => {
                    // get the bids of the auction in highest bid amount first order with it's bidder
                    const bids = await BidModel.find({ auction: auction?._id }).sort("-bidAmount").populate("bidder", "name email");

                    if (currentBidIndex < bids.length) {
                        const upperBid: any = bids[currentBidIndex - 1];
                        const upperBidder: any = upperBid?.bidder;
                        // upper bid is no longer topBid
                        await BidModel.findByIdAndUpdate(upperBid?._id, { isTopBid: false, updatedAt: Date.now() });

                        const lowerBid: any = bids[currentBidIndex];
                        const lowerBidder: any = lowerBid?.bidder;
                        // lower bid becomes top bid
                        await BidModel.findByIdAndUpdate(lowerBid?._id, { isTopBid: true, updatedAt: Date.now() });

                        // update the winning bid and bidder of the auction
                        await AuctionModel.findByIdAndUpdate(auction?._id, { winningBid: lowerBid, winner: lowerBidder, updatedAt: Date.now() });

                        const placeNo = currentBidIndex + 1;
                        const placeSuffix = getOrdinalSuffix(placeNo);
                        const place = `${placeNo}${placeSuffix}`;

                        // mail the upper bidder that we didn't receive the payment
                        await mailService.sendPaymentNotReceivedMailToBidder({ bidder: { email: upperBidder.email } });

                        // mail the creator that the prize is moving to next place bidder
                        await mailService.sendMoveToNextPlaceMailToCreator({ creator: { name: creator?.username as string, email: creator?.email as string }, bidderName: lowerBidder.name, wonAmount: lowerBid?.bidAmount, deliveryFee: schedule?.deliveryFee as number, place: place });

                        // mail the next place bidder that he won
                        await mailService.sendLowerBidderWonMailToBidder({
                            bidder: { name: lowerBidder.name, email: lowerBidder.email },
                            auction: { photo: String(auction?.photo), title: String(auction?.title), creator: creator?.username as string },
                            bidAmount: lowerBid?.bidAmount,
                            paymentLink: `${CONFIGS.URL.SERVER_BASE_URL}/stripe/checkout/${auction?._id}`,
                            deliveryFee: schedule?.deliveryFee as number,
                            avatar: creator?.avatar as string,
                        });

                        // schedule payment reminder mails
                        cronPaymentReminderMails(
                            { _id: creator?._id, username: creator?.username as string, avatar: creator?.avatar as string },
                            { _id: lowerBidder._id, name: lowerBidder.name, email: lowerBidder.email },
                            { _id: auction?._id, endDateTime: auction?.endDateTime as Date, photo: auction?.photo as string, title: auction?.title as string, winnerMessage: auction?.winnerMessage as string, shipType: auction?.shipType as ShipType, destination: auction?.destination as Destination },
                            lowerBid.bidAmount,
                            placeNo
                        );

                        currentBidIndex++;

                        // save the increased value of the current bid index
                        await SchedulerModel.findByIdAndUpdate(schedule._id, { currentBidIndex: currentBidIndex });
                    } else {
                        // Mail the creator that no bidder left
                        await mailService.sendNoBidderLeftMailToCreator({ creator: { name: creator?.username as string, email: creator?.email as string } });

                        // Mark all bid in this auction as non-topbid
                        await BidModel.updateMany({ auction: auction?._id }, { $set: { isTopBid: false, updatedAt: Date.now() } }, { multi: true });

                        // remove winning bid and winner from the auction
                        await AuctionModel.findByIdAndUpdate(auction?._id, { $unset: { winner: 1, winningBid: 1 } }); // <--- comment this when testing

                        // delete schedulers and cancel jobs
                        await this.cancelSchedulers(auction?._id, creator?.username as string);
                    }
                    // console.log('ran MOVE TO NEXT BIDDER'); // test log
                }
            );

        // console.log('scheduled MOVE TO NEXT BIDDER'); // test log
    }

    async paymentReminder(schedule: IScheduler) {
        const auction = await AuctionModel.findById(schedule.auction);
        // if (!auction) throw new CustomError(ErrorMessage.auction_not_found, 400);

        const creator = await CreatorModel.findById(schedule.creator);
        // if (!creator) throw new CustomError(ErrorMessage.creator_not_found, 400);

        const winner = await BidderModel.findById(schedule.bidder);
        // if (!winner) throw new CustomError(ErrorMessage.bidder_not_found, 400);

        if (auction && creator && winner)
            // send payment reminder mail
            cron.scheduleJob(schedule.name, schedule.runAt as Date, async () => {
                await mailService.sendPaymentReminderXHourMailToBidder({
                    bidder: { name: winner.name, email: winner.email },
                    auction: { photo: auction?.photo as string, title: auction?.title as string, creator: creator?.username as string },
                    bidAmount: schedule?.bidAmount as number,
                    paymentLink: `${CONFIGS.URL.SERVER_BASE_URL}/stripe/checkout/${auction?._id}`,
                    hoursLeft: schedule?.remainingHour as number,
                    deliveryFee: schedule?.deliveryFee as number,
                    avatar: creator.avatar,
                });
                // console.log('ran PAYMENT REMINDER'); // test log
            });

        // console.log('scheduled PAYMENT REMINDER'); // test log
    }

    async prizeDelivered(schedule: IScheduler) {
        // check if the auction exists with the winner
        const auction = await AuctionModel.findById(schedule.auction).populate("winner", "name email").populate("creator", "avatar");
        // if (!auction) throw new CustomError(ErrorMessage.auction_not_found, 400);

        if (auction) {
            const winner: any = auction.winner;
            const creator: any = auction.creator;

            // send prize delivered confirmation mail after 2 days
            cron.scheduleJob(schedule.name, schedule.runAt as Date, async () => {
                // notify the winner that the product has been delivered
                await mailService.sendPrizeDeliveredMailToBidder({
                    bidder: { name: winner.name as string, email: winner.email as string },
                    auction: { photo: auction?.photo as string, title: auction?.title as string, creator: creator?.username as string },
                    confirmLink: `${CONFIGS.URL.SERVER_BASE_URL}/stripe/payout/${auction?._id}`,
                    avatar: creator.avatar as string,
                });

                // delete prize delivered scheduler from database
                await SchedulerModel.findOneAndDelete({ name: schedule.name });
            });
        }
    }

    async payoutExecute(schedule: IScheduler) {
        // send prize delivered confirmation mail after 7 days
        cron.scheduleJob(schedule.name, schedule.runAt as Date, async () => {
            // check if the auction exists with the winner
            const auction = await AuctionModel.findById(schedule.auction);
            // if (!auction) throw new CustomError(ErrorMessage.auction_not_found, 400);

            if (auction) {
                if (!auction.payoutComplete) {
                    // if the payout is still not done
                    // release the payout immediately
                    StripeService.releasePayout({ params: { auctionId: auction._id } });
                }

                // delete payout execute scheduler from database
                await SchedulerModel.findOneAndDelete({ name: schedule.name });
            }
        });
    }

    async cancelSchedulers(auctionId: string, username: string) {
        // delete jobs
        await SchedulerModel.findOneAndDelete({ name: `${SchedulerType.AUCTION_STARTS}-${auctionId}` });
        await SchedulerModel.findOneAndDelete({ name: `${SchedulerType.AUCTION_ENDS}-${auctionId}` });
        await SchedulerModel.findOneAndDelete({ name: `${SchedulerType.GENERATE_CHECKOUT_URL}-${username}` });
        await SchedulerModel.findOneAndDelete({ name: `${SchedulerType.MOVE_TO_NEXT_BIDDER}-${username}` });
        await SchedulerModel.findOneAndDelete({ name: `${SchedulerType.REMINDER}-24hr-${username}` });
        await SchedulerModel.findOneAndDelete({ name: `${SchedulerType.REMINDER}-8hr-${username}` });
        await SchedulerModel.findOneAndDelete({ name: `${SchedulerType.REMINDER}-1hr-${username}` });

        // cancel the 48 hour mailing job and payment reminders
        cron.cancelJob(`${SchedulerType.GENERATE_CHECKOUT_URL}-${username}`);
        cron.cancelJob(`${SchedulerType.MOVE_TO_NEXT_BIDDER}-${username}`);
        cron.cancelJob(`${SchedulerType.REMINDER}-24hr-${username}`);
        cron.cancelJob(`${SchedulerType.REMINDER}-8hr-${username}`);
        cron.cancelJob(`${SchedulerType.REMINDER}-1hr-${username}`);

        // console.log('cancelled all jobs'); // test log
    }
}

export default new SchedulerService();
