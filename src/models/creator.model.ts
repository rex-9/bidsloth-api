import mongoose from "mongoose";
import { IAuction } from "./auction.model";
import { IIdea } from "./idea.model";
import { IRating } from "./rating.model";
import { IPromo } from "./promo.model";

export interface ICreator extends mongoose.Document {
    auctions: mongoose.Types.ObjectId[] | IAuction[];
    ideas: mongoose.Types.ObjectId[] | IIdea[];
    ratings: mongoose.Types.ObjectId[] | IRating[];
    promo?: mongoose.Types.ObjectId | IPromo;
    fullName?: string;
    username?: string;
    email: string;
    password?: string;
    emailVerified: boolean;
    accountDisabled: boolean;
    bidNotification?: boolean;
    commentNotification?: boolean;
    newsLetterNotification?: boolean;
    avatar: string;
    stripeId?: string;
    isStripeConnected: boolean;
    zinkUsername?: string;
    role: "creator" | "admin";
    lastActive: Date;
    createdAt?: Date;
    updatedAt?: Date;
}

const creatorSchema: mongoose.Schema<ICreator> = new mongoose.Schema<ICreator>(
    {
        auctions: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "auction",
                default: [],
            },
        ],

        ideas: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "idea",
                default: [],
            },
        ],

        ratings: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "rating",
                default: [],
            },
        ],

        promo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "promo",
            required: false,
        },

        fullName: {
            type: String,
            required: false,
        },

        avatar: {
            type: String,
            required: false,
        },

        username: {
            type: String,
            required: true,
            unique: true,
        },

        email: {
            type: String,
            required: true,
            unique: true,
        },

        password: {
            type: String,
            required: true,
            select: false,
        },

        emailVerified: {
            type: Boolean,
            required: false,
            default: false,
        },

        newsLetterNotification: {
            type: Boolean,
            required: false,
            default: true,
        },

        bidNotification: {
            type: Boolean,
            required: false,
            default: true,
        },

        commentNotification: {
            type: Boolean,
            required: true,
            default: true,
        },

        accountDisabled: {
            type: Boolean,
            required: true,
            default: false,
        },

        role: {
            type: String,
            required: true,
            enum: ["creator", "admin"],
            default: "creator",
        },

        stripeId: {
            type: String,
            required: false,
        },

        isStripeConnected: {
            type: Boolean,
            default: false,
            required: false,
        },

        zinkUsername: {
            type: String,
            required: false,
        },

        lastActive: {
            type: Date,
            required: true,
            default: Date.now,
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

export default mongoose.model<ICreator>("creator", creatorSchema);
