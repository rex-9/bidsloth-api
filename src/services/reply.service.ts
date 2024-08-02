import { Request } from "express";
import CustomError from "@/utilities/custom-error";
import Joi from "joi";

import ReplyModel from "@/models/reply.model";
import BidModel from "@/models/bid.model";
import { io } from "..";
import { ErrorMessage, socketEvents } from "@/utilities/constants";

class ReplyService {
	async create({ body, $currentUser }: Partial<Request>) {
    const { error, value: data } = Joi.object({
        body: Joi.object({
            bidId: Joi.string().required(),
            content: Joi.string().required(),
        }),
        $currentUser: Joi.object({
            _id: Joi.required(),
        }),
    })
        .options({ stripUnknown: true })
        .validate({ body, $currentUser });

    if (error) throw new CustomError(error.message, 400);

    let reply = await ReplyModel.findOne({ creator: data.$currentUser._id, bid: data.body.bidId });

    if (!reply) {
      // create a new reply
      reply = await new ReplyModel({ creator: data.$currentUser._id, bid: data.body.bidId, content: data.body.content }).save();
    } else {
      // update the content of the existing reply
      reply = await ReplyModel.findByIdAndUpdate(reply._id, { content: data.body.content, updatedAt: Date.now() });
    }

    // Add the reply to the bid
    const bid = await BidModel.findByIdAndUpdate(data.body.bidId, { reply: reply, updatedAt: Date.now() });
    if (!bid) throw new CustomError(ErrorMessage.bid_not_found, 400);

		// return object for reply socket event
		const replySocket = {
			bid: bid._id,
			creator: reply!.creator,
			content: reply!.content,
		}

		// socket.io
		io.emit(socketEvents.reply, replySocket);

		return replySocket;
	}

	async update({ body }: Partial<Request>) {		
		const { error, value: data } = Joi.object({
			body: Joi.object({
				replyId: Joi.string().required(),
        content: Joi.string().required(),
			}),
		})
			.options({ stripUnknown: true })
			.validate({ body });

    if (error) throw new CustomError(error.message, 400);

    // Update the reply
    const reply = await ReplyModel.findByIdAndUpdate(data.body.replyId, { content: data.body.content, updatedAt: Date.now() });

		return reply;
	}
}

export default new ReplyService();
