import { Request } from "express";
import CustomError from "@/utilities/custom-error";
import Joi from "joi";

import PromoModel from "@/models/promo.model";
import { ErrorMessage } from "@/utilities/constants";

class PromoService {
	async index() {
		const promos = await PromoModel.find();

		return promos;
	}

	async find({ body }: Partial<Request>) {		
		const { error, value: data } = Joi.object({
			body: Joi.object({
				code: Joi.string().required(),
			}),
		})
			.options({ stripUnknown: true })
			.validate({ body });
        
    if (error) throw new CustomError(error.message, 400);

		const promo = await PromoModel.find({ code: data.body.code });

		return promo;
	}

	async createMany({ body }: Partial<Request>) {		
		const { error, value: data } = Joi.object({
			body: Joi.object({
				codes: Joi.array()
					.items(Joi.string())
					.min(1).required(),
			}),
		})
			.options({ stripUnknown: true })
			.validate({ body });
        
        if (error) throw new CustomError(error.message, 400);

		data.body.codes.forEach(async (code: string) => {
			const existingPromo = await PromoModel.findOne({ code: code });
			if (!existingPromo) await new PromoModel({ code: code }).save();
		});

		return data.body.codes;
	}

	async createOne({ body }: Partial<Request>) {		
		const { error, value: data } = Joi.object({
			body: Joi.object({
				code: Joi.string(),
				multiUse: Joi.bool(),
				type: Joi.string().optional(),
				auctionCount: Joi.number().optional(),
				percentFee: Joi.number().optional(),
			}),
		})
			.options({ stripUnknown: true })
			.validate({ body });
        
    if (error) throw new CustomError(error.message, 400);

		const existingPromo = await PromoModel.findOne({ code: data.body.code });
		if (existingPromo) throw new CustomError(ErrorMessage.invite_code_exists, 400);

		const promo = await new PromoModel({ ...data.body }).save();

		return promo;
	}

	async validate({ body }: Partial<Request>) {		
		const { error, value: data } = Joi.object({
			body: Joi.object({
				code: Joi.string().required(),
			}),
		})
			.options({ stripUnknown: true })
			.validate({ body });
        
    if (error) throw new CustomError(error.message, 400);

		const promo = await PromoModel.findOne({ code: data.body.code });
		if (!promo) throw new CustomError(ErrorMessage.invite_code_not_found, 400);

		return true;
	}

	async delete({ body }: Partial<Request>) {
		const { error, value: data } = Joi.object({
			body: Joi.object({
				code: Joi.string().required(),
			})
		})
			.options({ stripUnknown: true })
			.validate({ body });

		if (error) throw new CustomError(error.message, 400);

		await PromoModel.findOneAndDelete({ code: data.body.code });
	
		return true;
	}

	async deleteAll() {
		await PromoModel.deleteMany();
	
		return true;
	}
}

export default new PromoService();
