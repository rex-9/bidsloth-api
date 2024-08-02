import mongoose from "mongoose";
import { ICreator } from "./creator.model";
import { ICharity } from "./charity.model";
import { IBid } from "./bid.model";
import { IBidder } from "./bidder.model";
import { IRating } from "./rating.model";
import { PaymentStatus, PlatformType, ShipType, Destination, PrizeDate, Social, Address } from "@/utilities/constants";

export interface IAuction extends mongoose.Document {
    charity?: mongoose.Types.ObjectId | ICharity;
    creator: mongoose.Types.ObjectId | ICreator;
    rating?: mongoose.Types.ObjectId | IRating;
    orderNo?: string;
    title?: string;
    description?: string;
    color?: string;
    photo?: string;
    video?: string;
    startDateTime?: Date;
    endDateTime?: Date;
    currency?: string;
    startPrice?: number;
    bidIncrement?: number;
    shipType?: ShipType;
    destination?: Destination;
    prizeDate?: PrizeDate;
    bidderMessage?: string;
    winnerMessage?: string;
    winnerExtraMessage?: string;
    social?: Social;
    paymentStatus?: PaymentStatus;
    payoutComplete: boolean;
    isDraft?: boolean;
    winningBid?: mongoose.Types.ObjectId | IBid;
    winner?: mongoose.Types.ObjectId | IBidder;
    isPrizeDelivered?: boolean;
    stripeProductId?: string;
    stripePriceId?: string;
    stripeSessionId?: string;
    stripeCheckoutUrl?: string;
    paymentIntentId?: string;
    loves?: number;
    bidCount?: number;
    commentCount?: number;
    deliveryAddress?: Address;
    ended: boolean;

    bids?: mongoose.Types.ObjectId[] | IBid[];
    bidders?: mongoose.Types.ObjectId[] | IBidder[];

    createdAt?: Date;
    updatedAt?: Date;
}

const auctionSchema: mongoose.Schema<IAuction> = new mongoose.Schema<IAuction>(
    {
        charity: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "charity",
            required: false,
        },
        creator: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "creator",
            required: true,
        },
        rating: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "rating",
        },
        orderNo: {
            type: String,
            unique: true,
            required: true,
        },
        title: {
            type: String,
            required: false,
        },
        description: {
            type: String,
            required: false,
        },
        color: {
            type: String,
            required: false,
        },
        photo: {
            type: String,
            required: false,
        },
        video: {
            type: String,
            required: false,
        },
        startDateTime: {
            type: Date,
            required: false,
        },
        endDateTime: {
            type: Date,
            required: false,
        },
        currency: {
            type: String,
            required: false,
        },
        startPrice: {
            type: Number,
            required: false,
        },
        bidIncrement: {
            type: Number,
            required: false,
        },
        shipType: {
            type: String,
            enum: Object.values(ShipType),
            required: false,
        },
        destination: {
            type: {
                location: {
                    type: String,
                    required: true,
                },
                deliveryFee: {
                    type: Number,
                    required: true,
                },
            },

            required: false,
        },
        prizeDate: {
            type: {
                month: {
                    type: Number,
                    required: true,
                },
                year: {
                    type: Number,
                    required: true,
                },
            },
            required: false,
        },
        bidderMessage: {
            type: String,
            required: false,
        },
        winnerMessage: {
            type: String,
            required: false,
        },
        winnerExtraMessage: {
            type: String,
            required: false,
        },
        social: {
            type: {
                platform: {
                    type: String,
                    enum: Object.values(PlatformType),
                    required: true,
                },
                platformId: {
                    type: String,
                    required: false,
                },
            },
            required: false,
        },
        paymentStatus: {
            type: String,
            enum: Object.values(PaymentStatus),
            default: PaymentStatus.PENDING,
            required: false,
        },
        payoutComplete: {
            type: Boolean,
            required: false,
            default: false,
        },
        isDraft: {
            type: Boolean,
            required: false,
            default: true,
        },
        winningBid: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "bid",
            required: false,
        },
        winner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "bidder",
            required: false,
        },
        isPrizeDelivered: {
            type: Boolean,
            required: false,
            default: false,
        },
        stripeProductId: {
            type: String,
            required: false,
        },
        stripePriceId: {
            type: String,
            required: false,
        },
        stripeSessionId: {
            type: String,
            required: false,
        },
        stripeCheckoutUrl: {
            type: String,
            required: false,
        },
        paymentIntentId: {
            type: String,
            required: false,
        },
        loves: {
            type: Number,
            default: 0,
            required: false,
            min: 0,
        },
        bidCount: {
            type: Number,
            default: 0,
            required: false,
            min: 0,
        },
        commentCount: {
            type: Number,
            default: 0,
            required: false,
            min: 0,
        },
        deliveryAddress: {
            type: {
                city: {
                    type: String,
                    required: false,
                },
                country: {
                    type: String,
                    required: true,
                },
                line1: {
                    type: String,
                    required: false,
                },
                line2: {
                    type: String,
                    required: false,
                },
                postal_code: {
                    type: String,
                    required: false,
                },
            },
            required: false,
        },
        bids: [
            {
                type: mongoose.Types.ObjectId,
                ref: "bid",
                default: [],
            },
        ],
        bidders: [
            {
                type: mongoose.Types.ObjectId,
                ref: "bidder",
                default: [],
            },
        ],
        ended: {
            type: Boolean,
            required: false,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

// set mongoose options to have lean turned on by default | ref: https://itnext.io/performance-tips-for-mongodb-mongoose-190732a5d382
mongoose.Query.prototype.setOptions = function () {
    if (this.mongooseOptions().lean == null) {
        this.mongooseOptions({ lean: true });
    }
    return this;
};

export default mongoose.model<IAuction>("auction", auctionSchema);
