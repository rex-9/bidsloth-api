import mongoose from "mongoose";
import { IAuction } from "./auction.model";
import { ICreator } from "./creator.model";
import { IBidder } from "./bidder.model";
import { SchedulerType } from "@/utilities/constants";

export interface IScheduler extends mongoose.Document {
    name: string;
    cron?: string;
    runAt?: Date;
    auction?: mongoose.Types.ObjectId | IAuction;
    creator?: mongoose.Types.ObjectId | ICreator;
    bidder?: mongoose.Types.ObjectId | IBidder;
    type: SchedulerType;
    successUrl?: string;
    cancelUrl?: string;
    currentBidIndex?: number;
    deliveryFee?: number;
    bidAmount?: number;
    remainingHour?: number;
    createdAt?: Date;
    updatedAt?: Date;
}

const schedulerSchema: mongoose.Schema<IScheduler> = new mongoose.Schema<IScheduler>(
    {
        name: {
            type: String,
            required: true,
            unique: true,
        },
        cron: {
            type: String,
            required: false,
        },
        runAt: {
            type: Date,
            required: false,
        },
        type: {
            type: String,
            enum: Object.values(SchedulerType),
            required: true,
        },
        successUrl: {
            type: String,
            required: false,
        },
        cancelUrl: {
            type: String,
            required: false,
        },
        currentBidIndex: {
            type: Number,
            required: false,
        },
        deliveryFee: {
            type: Number,
            required: false,
        },
        bidAmount: {
            type: Number,
            required: false,
        },
        remainingHour: {
            type: Number,
            required: false,
        },
        auction: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "auction",
            required: false,
        },
        creator: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "creator",
            required: false,
        },
        bidder: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "bidder",
            required: false,
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

export default mongoose.model<IScheduler>("scheduler", schedulerSchema);
