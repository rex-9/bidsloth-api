import { Request } from "express";
import Joi from "joi";
import CustomError from "@/utilities/custom-error";
import RatingModel from "@/models/rating.model";
import AuctionModel from "@/models/auction.model";
import CreatorModel from "@/models/creator.model";
import BidderModel from "@/models/bidder.model";

class RatingService {
    async getAll() {
        const bids = await RatingModel.find();

        return bids;
    }

    async getOne({ params }: Partial<Request>) {
        const { error, value: data } = Joi.object({
            params: Joi.object({
                auctionId: Joi.string().required(),
            }),
        })
            .options({ stripUnknown: true })
            .validate({ params });

        if (error) throw new CustomError(error.message, 400);

        const rating = await RatingModel.findOne({ auction: data.params.auctionId });

        return rating;
    }

    async getAllOfCreator({ params }: Partial<Request>) {
        const { error, value: data } = Joi.object({
            params: Joi.object({
                creatorId: Joi.string().required(),
            }),
        })
            .options({ stripUnknown: true })
            .validate({ params });

        if (error) throw new CustomError(error.message, 400);

        const ratings = await RatingModel.find({ creator: data.params.creatorId });

        return ratings;
    }

    async getAllOfBidder({ params }: Partial<Request>) {
        const { error, value: data } = Joi.object({
            params: Joi.object({
                creatorId: Joi.string().required(),
            }),
        })
            .options({ stripUnknown: true })
            .validate({ params });

        if (error) throw new CustomError(error.message, 400);

        const ratings = await RatingModel.find({ creator: data.params.creatorId });

        return ratings;
    }

    async create({ body }: Partial<Request>) {
        const { error, value: data } = Joi.object({
            body: Joi.object({
                creatorId: Joi.string().required(),
                auctionId: Joi.string().required(),
                bidderId: Joi.string().required(),
                stars: Joi.number().required(),
                note: Joi.string().optional(),
            }),
        })
            .options({ stripUnknown: true })
            .validate({ body });

        if (error) throw new CustomError(error.message, 400);

        const rating = await new RatingModel({ 
            creator: data.body.creatorId, 
            auction: data.body.auctionId, 
            bidder: data.body.auctionId, 
            stars: data.body.stars, 
            note: data.body.note 
        }).save();

        await AuctionModel.findByIdAndUpdate(data.body.auctionId, { rating: rating, updatedAt: Date.now() });

        await CreatorModel.findByIdAndUpdate(data.body.auctionId, { $push: { ratings: rating }, updatedAt: Date.now() });

        await BidderModel.findByIdAndUpdate(data.body.auctionId, { $push: { ratings: rating }, updatedAt: Date.now() });

        return rating;
    }

    async update({ params, body }: Partial<Request>) {
        const { error, value: data } = Joi.object({
            params: Joi.object({
                id: Joi.string().required(),
            }),
            body: Joi.object({
                creatorId: Joi.string().optional(),
                auctionId: Joi.string().optional(),
                bidderId: Joi.string().optional(),
                stars: Joi.number().optional(),
                note: Joi.string().optional(),
            })
        })
            .options({ stripUnknown: true })
            .validate({ params, body });

        if (error) throw new CustomError(error.message, 400);

        const rating = await RatingModel.findByIdAndUpdate(data.params.id, { ...data.body, updatedAt: Date.now() });

        return rating;
    }

    async delete({ params }: Partial<Request>) {
        const { error, value: data } = Joi.object({
            params: Joi.object({
                id: Joi.string().required(),
            }),
        })
            .options({ stripUnknown: true })
            .validate({ params });

        if (error) throw new CustomError(error.message, 400);

        const rating = await RatingModel.findByIdAndDelete(data.params.id);

        return rating;
    }

    async deleteAll() {
        const ratings = await RatingModel.deleteMany();

        return ratings;
    }
}

export default new RatingService();
