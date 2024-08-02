import { PromoType } from "@/utilities/constants";
import mongoose from "mongoose";

export interface IPromo extends mongoose.Document {
    code: string;
    auctionCount: number;
    percentFee: number;
    multiUse: boolean;
    type: PromoType;
    active: boolean;

    createdAt?: Date;
    updatedAt?: Date;
}

const promoSchema: mongoose.Schema<IPromo> = new mongoose.Schema<IPromo>(
    {
        code: {
            type: String,
            required: true,
        },
        multiUse: {
            type: Boolean,
            default: false,
        },
        auctionCount: {
            type: Number,
            default: 0,
        },
        percentFee: {
            type: Number,
            default: 10,
        },
        type: {
            type: String,
            enum: Object.values(PromoType),
            default: PromoType.INVITE,
        },
        active: {
            type: Boolean,
            default: true,
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

export default mongoose.model<IPromo>("promo", promoSchema);
