import mongoose from "mongoose";
import { IAuction } from "./auction.model";
import { IBidder } from "./bidder.model";
import { IReply } from "./reply.model";

export interface IBid extends mongoose.Document {
    auction: mongoose.Types.ObjectId | IAuction;
    bidder: mongoose.Types.ObjectId | IBidder;
    reply?: mongoose.Types.ObjectId | IReply;
    bidAmount: number;
    isTopBid: boolean;
    isWonBid: boolean;
    comment?: string;

    createdAt?: Date;
    updatedAt?: Date;
}

const bidSchema: mongoose.Schema<IBid> = new mongoose.Schema<IBid>(
    {
        auction: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "auction",
            required: true,
        },

        bidder: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "bidder",
            required: true,
        },

        reply: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "reply",
            required: false,
        },

        bidAmount: {
            type: Number,
            required: true,
        },

        comment: {
            type: String,
            required: false,
        },

        isTopBid: {
            type: Boolean,
            required: false,
            default: true,
        },

        isWonBid: {
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

export default mongoose.model<IBid>("bid", bidSchema);
