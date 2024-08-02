import mongoose from "mongoose";
import { ICreator } from "./creator.model";
import { IAuction } from "./auction.model";
import { IdeaType } from "@/utilities/constants";

export interface IIdea extends mongoose.Document {
    creator: mongoose.Types.ObjectId | ICreator;
    auction?: mongoose.Types.ObjectId | IAuction;
    creatorType: string;
    productType: string;
    uniqueness: number;
    idea: IdeaType;

    createdAt?: Date;
    updatedAt?: Date;
}

const ideaSchema: mongoose.Schema<IIdea> = new mongoose.Schema<IIdea>(
    {
        creator: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "creator",
            required: true,
        },

        auction: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "auction",
            required: false,
        },

        creatorType: {
            type: String,
            required: true,
        },

        productType: {
            type: String,
            required: true,
        },

        uniqueness: {
            type: Number,
            required: true,
        },

        idea: {
            type: {
                title: {
                    type: String,
                    required: true,
                },
                description: {
                    type: String,
                    required: true,
                },
            },
            required: true,
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

export default mongoose.model<IIdea>("idea", ideaSchema);
