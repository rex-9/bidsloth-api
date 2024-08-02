// import { CONFIGS } from "@/configs";
import crypto from "crypto";
import mongoose from "mongoose";

export interface IToken extends mongoose.Document {
    creator: mongoose.Types.ObjectId;
    code: string;
    token: string;
    bidderEmail: string;
    createdAt: Date;
}

const defaultCode: any = () => crypto.randomBytes(2).toString("hex").toUpperCase();
const defaultToken: any = () => crypto.randomBytes(32).toString("hex");

const tokenSchema: mongoose.Schema<IToken> = new mongoose.Schema<IToken>({
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "creator",
    },
    code: {
        type: String,
        required: false,
        default: defaultCode,
    },
    token: {
        type: String,
        required: false,
        default: defaultToken,
    },
    bidderEmail: {
        type: String,
        ref: "bidder",
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now,
        expires: 900,
        // expires: CONFIGS.TOKEN_EXPIRY_DURATION,
    },
});

const eitherCreatorIdOrBidderEmailRequired = function (this: IToken) {
    return Boolean(this.creator || this.bidderEmail);
};

tokenSchema.path("creator").validate(eitherCreatorIdOrBidderEmailRequired, "Either creator or bidderEmail is required.");
tokenSchema.path("bidderEmail").validate(eitherCreatorIdOrBidderEmailRequired, "Either creator or bidderEmail is required.");

// Set mongoose options to have lean turned on by default
mongoose.Query.prototype.setOptions = function () {
    if (this.mongooseOptions().lean == null) {
        this.mongooseOptions({ lean: true });
    }
    return this;
};

export default mongoose.model<IToken>("token", tokenSchema);
