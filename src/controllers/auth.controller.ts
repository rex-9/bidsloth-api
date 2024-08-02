import { Request, Response } from "express";

import response from "@/utilities/response";
import AuthService from "@/services/auth.service";

class AuthController {
  async register(req: Request, res: Response) {
    req.body = JSON.parse(req.body);
    const result = await AuthService.register({ ...req });
    res.status(201).send(response("new creator registered", result));
  }

  async login(req: Request, res: Response) {
    req.body = JSON.parse(req.body);
    const result = await AuthService.login({ ...req });
    res.status(200).send(response("creator login successful", result));
  }

  async verifyEmail(req: Request, res: Response) {
    req.body = JSON.parse(req.body);
    const result = await AuthService.verifyEmail({ ...req });
    res.status(200).send(response("email verification successful", result));
  }

  async requestEmailVerification(req: Request, res: Response) {
    req.body = JSON.parse(req.body);
    const result = await AuthService.requestEmailVerification(req.body.creatorId, false);
    res.status(200).send(response("email verification requested", result));
  }

  async requestPasswordReset(req: Request, res: Response) {
    req.body = JSON.parse(req.body);
    const result = await AuthService.requestPasswordReset({ ...req });
    res.status(200).send(response("password reset requested", result));
  }

  async resetPassword(req: Request, res: Response) {
    req.body = JSON.parse(req.body);
    const result = await AuthService.resetPassword({ ...req });
    res.status(200).send(response("password updated", result));
  }
}

export default new AuthController();
