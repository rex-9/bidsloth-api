import Joi from "joi";
import JWT from "jsonwebtoken";
import bcryptjs from "bcryptjs";
import { Request } from "express";

import { CONFIGS } from "@/configs";
import SchedulerModel from "@/models/scheduler.model";
import CreatorModel from "@/models/creator.model";
import TokenModel from "@/models/token.model";
import PromoModel from "@/models/promo.model";
import mailService from "@/services/mail.service";
import CustomError from "@/utilities/custom-error";
import { ErrorMessage, SchedulerType } from "@/utilities/constants";
import SchedulerService from "./scheduler.service";

class AuthService {
    async register({ body }: Partial<Request>) {
        const { error, value: data } = Joi.object({
            body: Joi.object({
                username: Joi.string().min(3).max(30).pattern(/^[a-zA-Z0-9]+$/).required().messages({
                    "string.base": "Sloth balls! Username should be a string!",
                    "string.empty": "Sloth balls! Username cannot be empty!",
                    "string.min": "Sloth balls! That username is too short!",
                    "string.max": "Sloth balls! That username is too long!",
                    "string.pattern.base": "Sloth balls! Username should only contain letters and numbers!",
                    "any.required": "Sloth balls! Username is required!",
                }),
                email: Joi.string().email().required().messages({
                    "string.base": "Sloth balls! Username should be a string!",
                    "string.email": "Hmm, that email doesn’t look real?",
                    "string.empty": "Sloth balls! Email can not be empty!",
                    "any.required": "Sloth balls! Email is required!",
                }),
                password: Joi.string().min(8).pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^\\s]).{8,}$")).required().messages({
                    "string.base": "Sloth balls! Password should be a string!",
                    "string.empty": "Sloth balls! Password cannot be empty!",
                    "any.required": "Sloth balls! Password is required!",
                    "string.min": "Sloth balls! That password is too short!",
                    "string.pattern.base": "Sloth balls! Password must include at least 1 uppercase letter, 1 lowercase letter, 1 digit, and 1 symbol!",
                }),
                code: Joi.string().required()
            }),
        })
            .options({ stripUnknown: true })
            .validate({ body });
        if (error) throw new CustomError(error.message, 400);

        // validate email
        const emailExist = await CreatorModel.findOne({ email: data.body.email });
        if (emailExist) throw new CustomError(ErrorMessage.email_taken, 400);

        // validate username
        const usernameExist = await CreatorModel.findOne({ username: data.body.username });
        if (usernameExist) throw new CustomError(ErrorMessage.username_taken, 400);

        const passwordHash = await bcryptjs.hash(data.body.password, CONFIGS.BCRYPT_SALT);

        // find the invite code and validate it
		const promo = await PromoModel.findOne({ code: data.body.code, active: true });
		if (!promo) throw new CustomError(ErrorMessage.invite_code_not_found, 400);

        // deactivate the used code if the code is for single use
        if (!promo.multiUse) await PromoModel.findOneAndUpdate({ code: data.body.code }, { active: false, updatedAt: Date.now() }, { new: true });

        // delete the invite code // if (data.body.code) 
        // await PromoModel.findOneAndDelete({ code: data.body.code });

        const context = {
            username: data.body.username.toLowerCase(),
            email: data.body.email,
            password: passwordHash,
            promo: data.body.code ? promo._id : null,
        };

        // Create new creator
        const creator = await new CreatorModel(context).save();

        // Generate token
        const token = JWT.sign({ _id: creator._id, role: creator.role, email: creator.email }, CONFIGS.JWT_SECRET, { expiresIn: CONFIGS.JWT_EXPIRES_IN });

        // Send email verification
        await this.requestEmailVerification(creator._id, true);

        // Create a copy of the creator object without the password property
        const creatorWithoutPassword = { ...creator.toObject() };
        delete creatorWithoutPassword.password;

        // send help mail after 5 days
        const fiveDaysFromNow = new Date();
        fiveDaysFromNow.setDate(fiveDaysFromNow.getDate() + 5);

        // save the help scheduler
        const helpSchedule = await new SchedulerModel({ name: `${SchedulerType.HELP}-${creator.username}`, runAt: fiveDaysFromNow, type: SchedulerType.HELP, creator: creator?._id }).save();

        // schedule to send help mail at the day after 5 days
        await SchedulerService.helpMail(helpSchedule);

        return { creator: creatorWithoutPassword, token };
    }

    async login({ body }: Partial<Request>) {
        const { error, value: data } = Joi.object({
            body: Joi.object({
                email: Joi.string().email().required().messages({
                    "string.base": "Sloth balls! Username should be a string!",
                    "string.email": "Hmm, that email doesn’t look real?",
                    "string.empty": "Sloth balls! Email can not be empty!",
                    "any.required": "Sloth balls! Email is required!",
                }),
                password: Joi.string().min(8).required().messages({
                    "string.base": "Sloth balls! Password should be a string!",
                    "string.empty": "Sloth balls! Password cannot be empty!",
                    "any.required": "Sloth balls! Password is required!",
                    "string.min": "Sloth balls! That password is too short!",
                }),
            }),
        })
            .options({ stripUnknown: true })
            .validate({ body });
        if (error) throw new CustomError(error.message, 400);

        // Check if email exists
        const creator = await CreatorModel.findOne({ email: data.body.email }).select("+password");
        if (!creator) throw new CustomError(ErrorMessage.creator_not_found, 400);

        // Check if password is correct
        const validPassword = await bcryptjs.compare(data.body.password, creator.password || "");
        if (!validPassword) throw new CustomError(ErrorMessage.wrong_email_or_password, 400);

        // update last seen
        await CreatorModel.updateOne({ _id: creator._id }, { $set: { lastActive: Date.now() } });

        // send verification code if isn't verified
        if (!creator.emailVerified) {
            // check if creator already has a token and delete it
            const creatorToken = await TokenModel.findOne({ creator: creator._id });
            if (creatorToken) await TokenModel.deleteOne({ _id: creatorToken._id });
            // Create new token
            const verificationToken = await new TokenModel({ creator: creator._id }).save();

            // send new verification link email
            await mailService.sendVerificationCodeEmail({ user: creator, verificationCode: verificationToken.code });
        }

        // Generate token
        const token = JWT.sign({ _id: creator._id, role: creator.role, email: creator.email }, CONFIGS.JWT_SECRET, { expiresIn: CONFIGS.JWT_EXPIRES_IN });

        // Remove password from response
        delete creator.password;

        return { creator, token };
    }

    async verifyEmail({ body }: Partial<Request>) {
        const { error, value: data } = Joi.object({
            body: Joi.object({
                creatorId: Joi.string().required(),
                verificationCode: Joi.string().min(4).required().messages({
                    "string.base": "Sloth balls! Code should be a string!",
                    "string.empty": "Sloth balls! Code can not be empty!",
                    "any.required": "Sloth balls! Code is required!",
                    "string.min": "Sloth balls! Code should be 4!",
                }),
            }),
        })
            .options({ stripUnknown: true })
            .validate({ body });
        if (error) throw new CustomError(error.message, 400);

        // Check if creator exists
        const creator = await CreatorModel.findOne({ _id: data.body.creatorId });

        if (!creator) throw new CustomError(ErrorMessage.creator_not_found, 400);

        // Check if email is already verified
        if (creator.emailVerified) throw new CustomError(ErrorMessage.creator_email_already_verified, 400);

        let validTokenCode = null;

        // if verificationCode, check if code is valid
        if (data.body.verificationCode) validTokenCode = await TokenModel.findOne({ code: data.body.verificationCode, creator: creator._id });

        if (!validTokenCode) throw new CustomError(ErrorMessage.code_expired, 400);

        // Update creator
        await CreatorModel.updateOne({ _id: creator._id }, { $set: { emailVerified: true, updatedAt: Date.now() } });

        // Delete token
        await TokenModel.deleteOne({ _id: validTokenCode._id });

        // Generate token
        const token = JWT.sign({ _id: creator._id, role: creator.role, email: creator.email }, CONFIGS.JWT_SECRET, { expiresIn: CONFIGS.JWT_EXPIRES_IN });

        creator.emailVerified = true;

        return { creator, token };
    }

    async requestEmailVerification(creatorId: string, isNewUser: boolean) {
        const { error, value: data } = Joi.object({
            creatorId: Joi.required(),
            isNewUser: Joi.boolean().required(),
        })
            .options({ stripUnknown: true })
            .validate({ creatorId, isNewUser });

        if (error) throw new CustomError(error.message, 400);

        // Check if creator exists
        const creator = await CreatorModel.findOne({ _id: data.creatorId });
        if (!creator) throw new CustomError(ErrorMessage.creator_not_found, 400);

        // Check if email is already verified
        if (creator.emailVerified) throw new CustomError(ErrorMessage.creator_email_already_verified, 401);

        // check if creator already has a token and delete it
        const creatorToken = await TokenModel.findOne({ creator: creator._id });
        if (creatorToken) await TokenModel.deleteOne({ _id: creatorToken._id });

        // Create new token
        const verificationToken = await new TokenModel({ creator: creator._id }).save();

        if (isNewUser) {
            // send welcome user email
            await mailService.sendWelcomeUserEmail({ user: creator, verificationCode: verificationToken.code });
        } else {
            // send new verification link email
            await mailService.sendVerificationCodeEmail({ user: creator, verificationCode: verificationToken.code });
        }

        return;
    }

    async requestPasswordReset({ body }: Partial<Request>) {
        const { error, value: data } = Joi.object({
            body: Joi.object({
                email: Joi.string().email().required().messages({
                    "string.base": "Sloth balls! Email should be a string!",
                    "string.email": "Hmm, that email doesn’t look real?",
                    "string.empty": "Sloth balls! Email can not be empty!",
                    "any.required": "Sloth balls! Email is required!",
                }),
            }),
        })
            .options({ stripUnknown: true })
            .validate({ body });
        if (error) throw new CustomError(error.message, 400);

        // Check if email exists by a creator
        const creator = await CreatorModel.findOne({ email: data.body.email });

        // Don't throw error if creator doesn't exist, just return null - so hackers don't exploit this route to know emails on the platform
        if (!creator) throw new CustomError(ErrorMessage.creator_not_found, 400);

        // Delete any previous token
        await TokenModel.deleteOne({ creator: creator._id });

        // Create new token
        const resetToken = await new TokenModel({ creator: creator._id }).save();

        // send password reset email
        await mailService.sendPasswordResetEmail({ user: creator, resetToken: resetToken.token });

        return;
    }

    async resetPassword({ body }: Partial<Request>) {
        const { error, value: data } = Joi.object({
            body: Joi.object({
                creatorId: Joi.string().required(),
                resetToken: Joi.string().required(),
                newPassword: Joi.string().min(8).pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^\\s]).{8,}$")).required().messages({
                    "string.base": "Sloth balls! Password should be a string!",
                    "string.empty": "Sloth balls! Password cannot be empty!",
                    "any.required": "Sloth balls! Password is required!",
                    "string.min": "Sloth balls! That password is too short!",
                    "string.pattern.base": "Sloth balls! Password must include at least 1 uppercase letter, 1 lowercase letter, 1 digit, and 1 symbol!",
                }),
            }),
        })
            .options({ stripUnknown: true })
            .validate({ body });
        if (error) throw new CustomError(error.message, 400);

        // Check if creator exists
        const creator = await CreatorModel.findOne({ _id: data.body.creatorId });
        if (!creator) throw new CustomError(ErrorMessage.creator_not_found, 400);

        // Check if token is valid
        const validResetToken = await TokenModel.findOne({ token: data.body.resetToken, creator: creator._id });
        if (!validResetToken) throw new CustomError(ErrorMessage.code_expired, 400);

        // Hash new password and update creator
        const passwordHash = await bcryptjs.hash(data.body.newPassword, CONFIGS.BCRYPT_SALT);
        await CreatorModel.updateOne({ _id: creator._id }, { $set: { password: passwordHash } });

        // Delete token
        await TokenModel.deleteOne({ _id: validResetToken._id });

        return;
    }
}

export default new AuthService();
