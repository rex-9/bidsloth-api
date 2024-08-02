import mongoose from "mongoose";

export interface ICharity extends mongoose.Document {
    name: string;
    desc?: string;
    logo?: string;
    stripeId: string;

    createdAt?: Date;
    updatedAt?: Date;
}

const charitySchema: mongoose.Schema<ICharity> = new mongoose.Schema<ICharity>(
    {
        name: {
            type: String,
            required: true,
        },

        desc: {
            type: String,
            required: false,
        },

        logo: {
            type: String,
            required: false,
        },

        stripeId: {
            type: String,
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

export default mongoose.model<ICharity>("charity", charitySchema);
