import mongoose from "mongoose";
import { IAuction } from "./auction.model";
import { IBidder } from "./bidder.model";
import { ICreator } from "./creator.model";

export interface IRating extends mongoose.Document {
    auction: mongoose.Types.ObjectId | IAuction;
    bidder: mongoose.Types.ObjectId | IBidder;
    creator: mongoose.Types.ObjectId | ICreator;
    stars: number;
    note?: string;

    createdAt?: Date;
    updatedAt?: Date;
}

const ratingSchema: mongoose.Schema<IRating> = new mongoose.Schema<IRating>(
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

        creator: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "creator",
            required: true,
        },

        stars: {
            type: Number,
            required: true,
        },

        note: {
            type: String,
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

export default mongoose.model<IRating>("rating", ratingSchema);
