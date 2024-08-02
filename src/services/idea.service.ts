import { Request } from "express";
import CustomError from "@/utilities/custom-error";
import Joi from "joi";

import IdeaModel from "@/models/idea.model";
import { generateIdea } from "@/utilities/openai";

class IdeaService {
    async index() {
        const ideas = await IdeaModel.find();

        return ideas;
    }

    async creatorIdeas({ params }: Partial<Request>) {
        const { error, value: data } = Joi.object({
            params: Joi.object({
                creatorId: Joi.string().required(),
            }),
        })
            .options({ stripUnknown: true })
            .validate({ params });

        if (error) throw new CustomError(error.message, 400);

        const ideas = await IdeaModel.find({ creator: data.params.creatorId });

        return ideas;
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

        const idea = await IdeaModel.findById(data.params.id);

        return idea;
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

        const idea = await IdeaModel.findByIdAndDelete(data.params.id);

        return idea;
    }

    async generate({ body, $currentUser }: Partial<Request>) {
        const { error, value: data } = Joi.object({
            body: Joi.object({
                creatorType: Joi.string().required(),
                productType: Joi.string().required(),
                uniqueness: Joi.number().required(),
            }),
            $currentUser: Joi.object({
                _id: Joi.required(),
            }),
        })
            .options({ stripUnknown: true })
            .validate({ body, $currentUser });

        if (error) throw new CustomError(error.message, 400);

        const gIdea = await generateIdea(data.body.creatorType, data.body.productType, data.body.uniqueness);

        const idea = await new IdeaModel({ creator: data.$currentUser._id, idea: gIdea, ...data.body }).save();

        console.log("Saved Idea: ", idea);

        return idea;
    }
}

export default new IdeaService();
