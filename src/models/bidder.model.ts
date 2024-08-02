import mongoose from "mongoose";
import { IAuction } from "./auction.model";
import { IBid } from "./bid.model";
import { IRating } from "./rating.model";
import { Address } from "@/utilities/constants";

export interface IBidder extends mongoose.Document {
    wonAuctions: mongoose.Types.ObjectId[] | IAuction[];
    bids: mongoose.Types.ObjectId[] | IBid[];
    ratings: mongoose.Types.ObjectId[] | IRating[];
    name: string;
    email: string;
    address?: Address;

    createdAt?: Date;
    updatedAt?: Date;
}

const bidderSchema: mongoose.Schema<IBidder> = new mongoose.Schema<IBidder>(
    {
        wonAuctions: [
            {
                type: mongoose.Types.ObjectId,
                ref: "auction",
                default: [],
            },
        ],

        bids: [
            {
                type: mongoose.Types.ObjectId,
                ref: "bid",
                default: [],
            },
        ],

        ratings: [
            {
                type: mongoose.Types.ObjectId,
                ref: "rating",
                default: [],
            },
        ],

        name: {
            type: String,
            required: false,
        },

        email: {
            type: String,
            unique: true,
            required: false,
        },

        address: {
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

export default mongoose.model<IBidder>("bidder", bidderSchema);
