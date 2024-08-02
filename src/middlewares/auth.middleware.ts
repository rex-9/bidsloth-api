import JWT from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

import { CONFIGS } from "@/configs";
import CreatorModel from "@/models/creator.model";
import CustomError from "@/utilities/custom-error";
import { ErrorMessage } from "@/utilities/constants";

/**
 * If no role is passed the default role is creator
 *
 * @param  {any[]} roles List of roles allowed to access the route
 */
function auth(roles: string[] = []) {
    roles = roles.length > 0 ? roles : CONFIGS.ROLES.USER;

    return async (req: Request, _res: Response, next: NextFunction) => {
        if (!req.headers.authorization) throw new CustomError(ErrorMessage.token_not_found, 401);

        const token: string = req.headers.authorization.split(" ")[1] || "";

        const decoded: any = JWT.verify(token, CONFIGS.JWT_SECRET, (err: any, decoded: any) => {
            if (err) throw new CustomError(`-middleware/${ErrorMessage.token_expired}`, 401);
            return decoded;
        });

        const creator = await CreatorModel.findOne({ _id: decoded._id });

        // creator not found
        if (!creator) throw new CustomError(`-middleware/${ErrorMessage.creator_not_found_or_not_logged_in}`, 401);

        // creator is deactivated
        if (creator.accountDisabled) throw new CustomError(`-middleware/${ErrorMessage.creator_deactivated}`, 401);

        // If email address is not verified
        if (!creator.emailVerified) throw new CustomError(`-middleware/${ErrorMessage.creator_email_not_verified}`, 401);

        // If role is not authorized to access route
        if (!roles.includes(creator.role)) throw new CustomError(`-middleware/${ErrorMessage.creator_not_authorized}`, 401);

        // Log lastActive for every request
        await CreatorModel.findByIdAndUpdate(creator._id, { lastActive: new Date() });

        // Attach creator to request
        req.$currentUser = creator;

        next();
    };
}

export default auth;
