import Mailer from "@/libraries/mailer";
import { ICreator } from "@/models/creator.model";
import { render } from "@react-email/components";

import WelcomeUserEmail from "@/email-templates/welcome-user";
import HelpEmail from "@/email-templates/help";
import CreatorVerificationLinkEmail from "@/email-templates/creator/verification";
import BidderVerificationLinkEmail from "@/email-templates/bidder/verification";
import PasswordResetEmail from "@/email-templates/password-reset";
import DeleteUserEmail from "@/email-templates/delete-user";
import CommentNotiEmail from "@/email-templates/creator/comment-noti";
import AuctionStartsEmail from "@/email-templates/creator/auction-start";
import DailyUpdateEmail from "@/email-templates/creator/auction-daily-update";
import AuctionEndsEmail from "@/email-templates/creator/auction-end";
import MoveToNextPlaceEmail from "@/email-templates/creator/move-to-next-place";
import NoBidderLeftEmail from "@/email-templates/creator/no-bidder-left";
import AuctionFailedEmail from "@/email-templates/creator/auction-failed";
import PaymentReceivedEmail from "@/email-templates/creator/payment-received";
import BidPlacedEmail from "@/email-templates/bidder/bid-placed";
import PrizeDeliveredEmail from "@/email-templates/bidder/prize-delivered";
import BidPlacedAgainEmail from "@/email-templates/bidder/bid-placed-again";
import OutbiddedEmail from "@/email-templates/bidder/bidder-outbidded";
import BidderWonEmail from "@/email-templates/bidder/bidder-won";
import PaymentNotReceivedEmail from "@/email-templates/bidder/payment-not-received";
import LowerBidderWonEmail from "@/email-templates/bidder/lower-bidder-won";
import PaymentReminderXHourEmail from "@/email-templates/bidder/payment-reminder";
import PaymentCompleteEmail from "@/email-templates/bidder/payment-complete";

import { CONFIGS } from "@/configs";
import { Address } from "@/utilities/constants";

class MailService {
    async sendWelcomeUserEmail(context: { user: Pick<ICreator, "_id" | "username" | "email">; verificationCode: string }) {
        const emailProp = {
            username: context.user.username,
            verificationCode: context.verificationCode,
        };

        return await Mailer.sendMail({
            to: context.user.email,
            subject: "Welcome to bidsloth",
            text: render(WelcomeUserEmail(emailProp), { plainText: true }),
            html: render(WelcomeUserEmail(emailProp)),
        });
    }

    async sendHelpEmail(context: { user: Pick<ICreator, "_id" | "username" | "email"> }) {
        const emailProp = {
            username: context.user.username,
        };

        return await Mailer.sendMail({
            to: context.user.email,
            subject: "Sloths at your service",
            text: render(HelpEmail(emailProp), { plainText: true }),
            html: render(HelpEmail(emailProp)),
        });
    }

    async sendVerificationCodeEmail(context: { user: Pick<ICreator, "_id" | "username" | "email">; verificationCode: string }) {
        const emailProp = {
            username: context.user.username,
            verificationCode: context.verificationCode,
        };

        return await Mailer.sendMail({
            to: context.user.email,
            subject: "Verify your email address",
            text: render(CreatorVerificationLinkEmail(emailProp), { plainText: true }),
            html: render(CreatorVerificationLinkEmail(emailProp)),
        });
    }

    async sendPasswordResetEmail(context: { user: Pick<ICreator, "_id" | "username" | "email">; resetToken: string }) {
        const emailProp = {
            username: context.user.username,
            resetLink: `${CONFIGS.URL.LANDING_BASE_URL}/reset-password?resetToken=${context.resetToken}&creatorId=${context.user._id}`,
        };

        return await Mailer.sendMail({
            to: context.user.email,
            subject: "Reset your password",
            text: render(PasswordResetEmail(emailProp), { plainText: true }),
            html: render(PasswordResetEmail(emailProp)),
        });
    }

    async sendDeleteEmail(context: { user: Pick<ICreator, "_id" | "username" | "email"> }) {
        return await Mailer.sendMail({
            to: context.user.email,
            subject: "Go-eeeeee!",
            text: render(DeleteUserEmail(), { plainText: true }),
            html: render(DeleteUserEmail()),
        });
    }

    // Creator Mails
    async sendAuctionStartsMailToCreator(context: { creator: { name: string; email: string; photo: string }; title: string; auctionLink: string }) {
        const emailProp = {
            username: context.creator.name,
            photo: context.creator.photo,
            title: context.title,
            auctionLink: context.auctionLink,
        };

        return await Mailer.sendMail({
            to: context.creator.email,
            subject: "Auction Starts!",
            text: render(AuctionStartsEmail(emailProp), { plainText: true }),
            html: render(AuctionStartsEmail(emailProp)),
        });
    }

    async sendDailyUpdateMailToCreator(context: { creator: { name: string; email: string }; auction: { photo: string; topBid: number; bidCount: number; commentCount: number; countDown: number | { days: number; hours: number; mins: number; secs: number } } }) {
        const emailProp = {
            username: context.creator.name,
            photo: context.auction.photo,
            topBid: context.auction.topBid,
            bidCount: context.auction.bidCount,
            commentCount: context.auction.commentCount,
            countDown: context.auction.countDown,
        };

        return await Mailer.sendMail({
            to: context.creator.email,
            subject: "Auction Daily Update!",
            text: render(DailyUpdateEmail(emailProp), { plainText: true }),
            html: render(DailyUpdateEmail(emailProp)),
        });
    }

    async sendCommentNotiMailToCreator(context: { creator: { name: string; email: string }; comment: string; link: string }) {
        const emailProp = {
            username: context.creator.name,
            comment: context.comment,
            link: context.link,
        };

        return await Mailer.sendMail({
            to: context.creator.email,
            subject: "Eeee! Comment!",
            text: render(CommentNotiEmail(emailProp), { plainText: true }),
            html: render(CommentNotiEmail(emailProp)),
        });
    }

    async sendAuctionEndsMailToCreator(context: { creator: { name: string; email: string }; bidderName: string; wonAmount: number; deliveryFee: number }) {
        const emailProp = {
            username: context.creator.name,
            bidderName: context.bidderName,
            wonAmount: context.wonAmount,
            deliveryFee: context.deliveryFee,
        };

        return await Mailer.sendMail({
            to: context.creator.email,
            subject: "Auction Ends!",
            text: render(AuctionEndsEmail(emailProp), { plainText: true }),
            html: render(AuctionEndsEmail(emailProp)),
        });
    }

    async sendMoveToNextPlaceMailToCreator(context: { creator: { name: string; email: string }; bidderName: string; wonAmount: number; deliveryFee: number; place: string }) {
        const emailProp = {
            username: context.creator.name,
            bidderName: context.bidderName,
            wonAmount: context.wonAmount,
            deliveryFee: context.deliveryFee,
            place: context.place,
        };

        return await Mailer.sendMail({
            to: context.creator.email,
            subject: "Onto Next Place!",
            text: render(MoveToNextPlaceEmail(emailProp), { plainText: true }),
            html: render(MoveToNextPlaceEmail(emailProp)),
        });
    }

    async sendNoBidderLeftMailToCreator(context: { creator: { name: string; email: string } }) {
        const emailProp = {
            username: context.creator.name,
        };

        return await Mailer.sendMail({
            to: context.creator.email,
            subject: "Sadly! No Bidder Left!",
            text: render(NoBidderLeftEmail(emailProp), { plainText: true }),
            html: render(NoBidderLeftEmail(emailProp)),
        });
    }

    async sendAuctionFailedMailToCreator(context: { creator: { name: string; email: string } }) {
        const emailProp = {
            username: context.creator.name,
        };

        return await Mailer.sendMail({
            to: context.creator.email,
            subject: "Sadly! No one Bid!",
            text: render(AuctionFailedEmail(emailProp), { plainText: true }),
            html: render(AuctionFailedEmail(emailProp)),
        });
    }

    async sendPaymentReceivedMailToCreator(context: { creator: { name: string; email: string }; photo: string; bidderName: string; wonAmount: number; address: Address; deliveryFee: number }) {
        const emailProp = {
            username: context.creator.name,
            photo: context.photo,
            bidderName: context.bidderName,
            wonAmount: context.wonAmount,
            address: context.address,
            deliveryFee: context.deliveryFee,
        };

        return await Mailer.sendMail({
            to: context.creator.email,
            subject: "Payment Received!",
            text: render(PaymentReceivedEmail(emailProp), { plainText: true }),
            html: render(PaymentReceivedEmail(emailProp)),
        });
    }

    // Bidder Mails
    async sendVerificationCodeMailToBidder(context: { bidder: { name: string; email: string }; verificationCode: string }) {
        const emailProp = {
            username: context.bidder.name,
            verificationCode: context.verificationCode,
        };

        return await Mailer.sendMail({
            to: context.bidder.email,
            subject: "Verify your email address",
            text: render(BidderVerificationLinkEmail(emailProp), { plainText: true }),
            html: render(BidderVerificationLinkEmail(emailProp)),
        });
    }

    async sendBidPlacedMailToBidder(context: {
        bidder: { name: string; email: string };
        auction: { photo: string; title: string; creator: string };
        bidAmount: number;
        countDown: number | { days: number; hours: number; mins: number; secs: number };
        thankMessage: string;
        auctionLink: string;
        avatar: string;
    }) {
        const emailProp = {
            username: context.bidder.name,
            auction: context.auction,
            bidAmount: context.bidAmount,
            countDown: context.countDown,
            thankMessage: context.thankMessage,
            auctionLink: context.auctionLink,
            avatar: context.avatar,
        };

        return await Mailer.sendMail({
            to: context.bidder.email,
            subject: "You bid is placed!",
            text: render(BidPlacedEmail(emailProp), { plainText: true }),
            html: render(BidPlacedEmail(emailProp)),
        });
    }

    async sendBidPlacedAgainMailToBidder(context: { bidder: { name: string; email: string }; auction: { photo: string; title: string; creator: string }; bidAmount: number; countDown: number | { days: number; hours: number; mins: number; secs: number }; avatar: string }) {
        const emailProp = {
            username: context.bidder.name,
            auction: context.auction,
            bidAmount: context.bidAmount,
            countDown: context.countDown,
            avatar: context.avatar,
        };

        return await Mailer.sendMail({
            to: context.bidder.email,
            subject: "You bid is placed!",
            text: render(BidPlacedAgainEmail(emailProp), { plainText: true }),
            html: render(BidPlacedAgainEmail(emailProp)),
        });
    }

    async sendOutbiddedMailToBidder(context: { bidder: { name: string; email: string }; auction: { photo: string; title: string; creator: string }; bidAmount: number; countDown: number | { days: number; hours: number; mins: number; secs: number }; auctionLink: string; avatar: string }) {
        const emailProp = {
            username: context.bidder.name,
            auction: context.auction,
            bidAmount: context.bidAmount,
            countDown: context.countDown,
            auctionLink: context.auctionLink,
            avatar: context.avatar,
        };

        return await Mailer.sendMail({
            to: context.bidder.email,
            subject: "You have been Outbidded!",
            text: render(OutbiddedEmail(emailProp), { plainText: true }),
            html: render(OutbiddedEmail(emailProp)),
        });
    }

    async sendBidderWonMailToBidder(context: { bidder: { name: string; email: string }; auction: { photo: string; title: string; creator: string }; bidAmount: number; paymentLink: string; deliveryFee: number; avatar: string }) {
        const emailProp = {
            username: context.bidder.name,
            auction: context.auction,
            bidAmount: context.bidAmount,
            paymentLink: context.paymentLink,
            deliveryFee: context.deliveryFee,
            avatar: context.avatar,
        };

        return await Mailer.sendMail({
            to: context.bidder.email,
            subject: "CONGRATULATIONS!",
            text: render(BidderWonEmail(emailProp), { plainText: true }),
            html: render(BidderWonEmail(emailProp)),
        });
    }

    async sendPaymentNotReceivedMailToBidder(context: { bidder: { email: string } }) {
        return await Mailer.sendMail({
            to: context.bidder.email,
            subject: "Out of time!",
            text: render(PaymentNotReceivedEmail(), { plainText: true }),
            html: render(PaymentNotReceivedEmail()),
        });
    }

    async sendPrizeDeliveredMailToBidder(context: { bidder: { name: string; email: string }; auction: { photo: string; title: string; creator: string }; confirmLink: string; avatar: string }) {
        const emailProp = {
            username: context.bidder.name,
            email: context.bidder.email,
            auction: context.auction,
            confirmLink: context.confirmLink,
            avatar: context.avatar,
        };
        return await Mailer.sendMail({
            to: emailProp.email,
            subject: "Prize Delivered!",
            text: render(PrizeDeliveredEmail(emailProp), { plainText: true }),
            html: render(PrizeDeliveredEmail(emailProp)),
        });
    }

    async sendLowerBidderWonMailToBidder(context: { bidder: { name: string; email: string }; auction: { photo: string; title: string; creator: string }; bidAmount: number; paymentLink: string; deliveryFee: number; avatar: string }) {
        const emailProp = {
            username: context.bidder.name,
            auction: context.auction,
            bidAmount: context.bidAmount,
            paymentLink: context.paymentLink,
            deliveryFee: context.deliveryFee,
            avatar: context.avatar,
        };

        return await Mailer.sendMail({
            to: context.bidder.email,
            subject: "CONGRATULATIONS!",
            text: render(LowerBidderWonEmail(emailProp), { plainText: true }),
            html: render(LowerBidderWonEmail(emailProp)),
        });
    }

    async sendPaymentReminderXHourMailToBidder(context: { bidder: { name: string; email: string }; auction: { photo: string; title: string; creator: string }; bidAmount: number; paymentLink: string; hoursLeft: number; deliveryFee: number; avatar: string }) {
        const emailProp = {
            username: context.bidder.name,
            auction: context.auction,
            bidAmount: context.bidAmount,
            paymentLink: context.paymentLink,
            hoursLeft: context.hoursLeft,
            deliveryFee: context.deliveryFee,
            avatar: context.avatar,
        };

        return await Mailer.sendMail({
            to: context.bidder.email,
            subject: "Payment Reminder to claim your prize!",
            text: render(PaymentReminderXHourEmail(emailProp), { plainText: true }),
            html: render(PaymentReminderXHourEmail(emailProp)),
        });
    }

    async sendPaymentCompleteMailToBidder(context: {
        bidder: { name: string; email: string };
        auction: { photo: string; title: string; creator: string };
        bidAmount: number;
        social: { platform: string; platformId: string };
        winnerMessage: string;
        winnerExtraMessage: string;
        orderNo: string;
        deliveryFee: number;
        avatar: string;
    }) {
        const emailProp = {
            username: context.bidder.name,
            auction: context.auction,
            bidAmount: context.bidAmount,
            social: context.social,
            winnerMessage: context.winnerMessage,
            winnerExtraMessage: context.winnerExtraMessage,
            orderNo: context.orderNo,
            deliveryFee: context.deliveryFee,
            avatar: context.avatar,
        };

        return await Mailer.sendMail({
            to: context.bidder.email,
            subject: "Payment Complete!",
            text: render(PaymentCompleteEmail(emailProp), { plainText: true }),
            html: render(PaymentCompleteEmail(emailProp)),
        });
    }
}

// For testing purposes, uncomment code below and run `yarn start`
// new MailService().sendWelcomeUserEmail({
//     user: {
//         _id: "5f9b3b1b9b3b1b9b3b1b9b3b",
//         firstName: "John",
//         email: "", // Add your email here to test
//     },
//     verificationToken: "5f9b3b1b9b3b1b9b3b1b9b3b",
// });

export default new MailService();
