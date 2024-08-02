import { Request } from "express";
import CustomError from "@/utilities/custom-error";
import Joi from "joi";

import BidModel from "@/models/bid.model";

class BidderService {
	async index({ body }: Partial<Request>) {		
		const { error, value: data } = Joi.object({
			body: Joi.object({
				auctionId: Joi.string().required(),
			}),
		})
			.options({ stripUnknown: true })
			.validate({ body });
        
        if (error) throw new CustomError(error.message, 400);

		const bidders = await BidModel.find({ auction: data.body.auctionId });

		return bidders;
	}
}

export default new BidderService();
