import { Request } from "express";
import CustomError from "@/utilities/custom-error";
import Joi from "joi";

import CharityModel from "@/models/charity.model";

class CharityService {
    async getAll() {
        const charities = await CharityModel.find();

        return charities;
    }

    async detail({ params }: Partial<Request>) {
        const { error, value: data } = Joi.object({
            params: Joi.object({
                id: Joi.string().required(),
            }),
        })
            .options({ stripUnknown: true })
            .validate({ params });

        if (error) throw new CustomError(error.message, 400);

        const charity = await CharityModel.findById(data.params.id);

        return charity;
    }

    async create({ body, $currentUser }: Partial<Request>) {
        const { error, value: data } = Joi.object({
            body: Joi.object({
                name: Joi.string().required(),
                desc: Joi.string().optional(),
                logo: Joi.string().optional(),
                stripeId: Joi.string().required(),
            }),
            $currentUser: Joi.object({
                _id: Joi.required(),
            }),
        })
            .options({ stripUnknown: true })
            .validate({ body, $currentUser });

        if (error) throw new CustomError(error.message, 400);

        const charity = await new CharityModel({ ...data.body }).save();

        return charity;
    }


    async update({ params, body, $currentUser }: Partial<Request>) {
        const { error, value: data } = Joi.object({
            params: Joi.object({
                id: Joi.string().required(),
            }),            
            body: Joi.object({
                name: Joi.string().required(),
                desc: Joi.string().optional(),
                logo: Joi.string().optional(),
                stripeId: Joi.string().required(),
            }),
            $currentUser: Joi.object({
                _id: Joi.required(),
            }),
        })
            .options({ stripUnknown: true })
            .validate({ params, body, $currentUser });

        if (error) throw new CustomError(error.message, 400);

        await CharityModel.findByIdAndUpdate(data.params.id, { ...data.body, updatedAt: Date.now() }, { new: true });

        const charity = await CharityModel.findById(data.params.id);

        return charity;
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

        const charity = await CharityModel.findByIdAndDelete(data.params.id);

        return charity;
    }
}

export default new CharityService();
