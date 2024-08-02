import mongoose from "mongoose";
import { IBid } from "./bid.model";
import { ICreator } from "./creator.model";

export interface IReply extends mongoose.Document {
    creator: mongoose.Types.ObjectId | ICreator;
    bid: mongoose.Types.ObjectId | IBid;
    content: string;

    createdAt?: Date;
    updatedAt?: Date;
}

const replySchema: mongoose.Schema<IReply> = new mongoose.Schema<IReply>(
    {
        creator: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'creator',
            required: true,
        },
        
        bid: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'bid',
            required: true,
        },

        content: {
            type: String,
            required: true,
        }
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

export default mongoose.model<IReply>("reply", replySchema);
