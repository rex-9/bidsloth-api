import Joi from "joi";
import bcryptjs from "bcryptjs";
import { Request } from "express";

import { CONFIGS } from "@/configs";
import mailService from "@/services/mail.service";
import AuctionModel from "@/models/auction.model";
import CreatorModel from "@/models/creator.model";
import ReplyModel from "@/models/reply.model";
import BidModel from "@/models/bid.model";
import CustomError from "@/utilities/custom-error";
import { uploadToCloudinary } from "@/utilities/cloudinary";
import { ErrorMessage } from "@/utilities/constants";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const stripe = require("stripe")(CONFIGS.STRIPE.STRIPE_SECRET_KEY);

class CreatorService {
    async getCreator({ body }: Partial<Request>) {
        const { error, value: data } = Joi.object({
            body: Joi.object({
                creatorId: Joi.string().required(),
            }),
        })
            .options({ stripUnknown: true })
            .validate({ body });
        if (error) throw new CustomError(error.message, 400);

        const creator = await CreatorModel.findOne({ _id: data.body.creatorId });

        return creator;
    }

    async confirm({ params }: Partial<Request>) {
        const { error, value: data } = Joi.object({
            params: Joi.object({
                username: Joi.string().required(),
            }),
        })
            .options({ stripUnknown: true })
            .validate({ params });
        if (error) throw new CustomError(error.message, 400);

        const creator = await CreatorModel.findOne({ username: data.params.username });
        if (creator) {
            return true;
        } else {
            return false;
        }
    }

    async getCurrentUser({ $currentUser }: Partial<Request>) {
        const { error, value: data } = Joi.object({
            $currentUser: Joi.object({
                _id: Joi.required(),
            }),
        })
            .options({ stripUnknown: true })
            .validate({ $currentUser });
        if (error) throw new CustomError(error.message, 400);

        const creator = await CreatorModel.findOne({ _id: data.$currentUser._id });
        if (!creator) throw new CustomError(ErrorMessage.creator_not_found, 400);

        // find auctions of the creator in the latest first order
        const auctions = await AuctionModel.find({ creator: creator._id }).sort({ createdAt: -1 });

        creator.auctions = auctions;

        return creator;
    }

    async updateProfile({ body, $currentUser }: Partial<Request>) {
        const { error, value: data } = Joi.object({
            body: Joi.object({
                fullName: Joi.string().optional(),
                avatar: Joi.string().optional(),
                zinkUsername: Joi.string().optional(),
            }),
            $currentUser: Joi.object({
                _id: Joi.required(),
            }),
        })
            .options({ stripUnknown: true })
            .validate({ body, $currentUser });
        if (error) throw new CustomError(error.message, 400);

        const profileData: any = {
            fullName: data.body.fullName,
            zinkUsername: data.body.zinkUsername,
        };

        // if avatar is in the payload
        if (data.body.avatar) {
            // Upload to cloudinary and retrieve the avatar object
            const imgUrl = await uploadToCloudinary("image", "png", data.body.avatar, "bidsloth_avatars", String($currentUser?.username));
            profileData.avatar = imgUrl.secure_url;
        }

        // Check if creator exists
        const creator = await CreatorModel.findOneAndUpdate({ _id: data.$currentUser._id }, { $set: { ...profileData, updatedAt: Date.now() } }, { new: true });
        if (!creator) throw new CustomError(ErrorMessage.creator_not_found, 400);

        if (data.body.fullName) creator.fullName = data.body.fullName;
        if (data.body.zinkUsername) creator.zinkUsername = data.body.zinkUsername;
        if (data.body.avatar) creator.avatar = profileData.avatar;

        return creator;
    }

    async updatePassword({ body, $currentUser }: Partial<Request>) {
        const { error, value: data } = Joi.object({
            body: Joi.object({
                currentPassword: Joi.string().required(),
                newPassword: Joi.string().required(),
            }),
            $currentUser: Joi.object({
                _id: Joi.required(),
            }),
        })
            .options({ stripUnknown: true })
            .validate({ body, $currentUser });
        if (error) throw new CustomError(error.message, 400);

        // Check if creator exists
        const creator = await CreatorModel.findOne({ _id: data.$currentUser._id }).select("+password");
        if (!creator) throw new CustomError(ErrorMessage.creator_not_found, 400);

        // Check if password is correct
        const isPasswordCorrect = await bcryptjs.compare(data.body.currentPassword, creator.password || "");
        if (!isPasswordCorrect) throw new CustomError(ErrorMessage.old_password_wrong, 400);

        // Hash new password and update creator
        const passwordHash = await bcryptjs.hash(data.body.newPassword, CONFIGS.BCRYPT_SALT);
        await CreatorModel.updateOne({ _id: creator._id }, { $set: { password: passwordHash, updatedAt: Date.now() } });

        return;
    }
    async updateAvatar({ body, $currentUser }: Partial<Request>) {
        const { error, value: data } = Joi.object({
            body: Joi.object({
                avatar: Joi.string().base64().required(),
            }),
            $currentUser: Joi.object({
                _id: Joi.required(),
            }),
        })
            .options({ stripUnknown: true })
            .validate({ body, $currentUser });

        if (error) throw new CustomError(error.message, 400);

        if (!data.body.avatar) {
            throw new CustomError(ErrorMessage.avatar_not_uploaded, 400);
        }

        // Check if creator exists
        const creator = await CreatorModel.findOne({ _id: data.$currentUser._id });

        if (!creator) throw new CustomError(ErrorMessage.creator_not_found, 400);

        // Upload to cloudinary and retrieve the avatar object
        const imgUrl = await uploadToCloudinary("image", "png", data.body.avatar, "bidsloth_avatars", String($currentUser?.username));

        // Update creator
        await CreatorModel.updateOne({ _id: creator._id }, { $set: { avatar: imgUrl.secure_url, updatedAt: Date.now() } });

        // Remove password from response
        delete creator.password;

        // add avatar to update
        creator.avatar = imgUrl.secure_url;

        return { creator };
    }

    async updateEmailNotification({ body, $currentUser }: Partial<Request>) {
        const { error, value: data } = Joi.object({
            body: Joi.object({
                commentNotification: Joi.boolean().optional(),
                bidNotification: Joi.boolean().optional(),
                newsLetterNotification: Joi.boolean().optional(),
            }),
            $currentUser: Joi.object({
                _id: Joi.required(),
            }),
        })
            .options({ stripUnknown: true })
            .validate({ body, $currentUser });
        if (error) throw new CustomError(error.message, 400);

        // Check if creator exists
        const creator = await CreatorModel.findOneAndUpdate({ _id: data.$currentUser._id }, { $set: { ...data.body, updatedAt: Date.now() } }, { new: true });
        if (!creator) throw new CustomError(ErrorMessage.creator_not_found, 404);

        if (data.body.commentNotification) creator.commentNotification = data.body.commentNotification;
        if (data.body.bidNotification) creator.bidNotification = data.body.bidNotification;
        if (data.body.newsLetterNotification) creator.newsLetterNotification = data.body.newsLetterNotification;

        const updatedCreator = await CreatorModel.findById(data.$currentUser._id);

        return updatedCreator;
    }

    async delete({ $currentUser }: Partial<Request>) {
        const { error, value: data } = Joi.object({
            $currentUser: Joi.object({
                _id: Joi.required(),
            }),
        })
            .options({ stripUnknown: true })
            .validate({ $currentUser });

        if (error) throw new CustomError(error.message, 400);

        // find the latest auction
        const latestAuction = await AuctionModel.findOne({ creator: data.$currentUser._id }).sort({ createdAt: -1 });

        // if latest auction exists and still not completed
        if (latestAuction && !latestAuction.ended) throw new CustomError(ErrorMessage.latest_auction_not_complete, 400);

        // Find the creator
        const creator = await CreatorModel.findById(data.$currentUser._id);
        if (!creator) throw new CustomError(ErrorMessage.creator_not_found, 404);

        // Delete the creator
        await CreatorModel.findByIdAndDelete(data.$currentUser._id);

        // Delete the stripe account of the creator
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        if (creator.stripeId) await stripe.accounts.del(creator.stripeId);

        // fetch auctions of the deleted creator
        const auctions = await AuctionModel.find({ creator: data.$currentUser._id });

        if (auctions.length > 0) {
            // Delete bids of the creator's auctions
            auctions.forEach(async (auction: any) => {
                await BidModel.deleteMany({ auction: auction._id });
            });
        }

        // Delete auctions of the deleted creator
        await AuctionModel.deleteMany({ creator: data.$currentUser._id });

        // Delete replies of the deleted creator
        await ReplyModel.deleteMany({ creator: data.$currentUser._id });

        // Send DELETE email notification
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        await mailService.sendDeleteEmail({ user: creator });

        return true;
    }
}

export default new CreatorService();
