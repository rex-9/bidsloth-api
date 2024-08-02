import { Request, Response } from "express";

import response from "@/utilities/response";
import CreatorService from "@/services/creator.service";

class CreatorController {
  async delete(req: Request, res: Response) {
    const result = await CreatorService.delete({ ...req });
    res.status(200).send(response("creator deleted", result));
  }

  async getCreator(req: Request, res: Response) {
    req.body = JSON.parse(req.body);
    const result = await CreatorService.getCreator({ ...req });
    res.status(200).send(response("creator retrieved", result));
  }

  async confirm(req: Request, res: Response) {
    const result = await CreatorService.confirm({ ...req });
    res.status(200).send(response("creator confirmed", result));
  }

  async getCurrentUser(req: Request, res: Response) {
    const result = await CreatorService.getCurrentUser({ ...req });
    res.status(200).send(response("creator retrieved", result));
  }

  async updateProfile(req: Request, res: Response) {
    req.body = JSON.parse(req.body);
    const result = await CreatorService.updateProfile({ ...req });
    res.status(200).send(response("Woop woop! Mission: Profile Update - Complete!", result));
  }

  async updatePassword(req: Request, res: Response) {
    req.body = JSON.parse(req.body);
    const result = await CreatorService.updatePassword({ ...req });
    res.status(200).send(response("Woop woop! Password updated!", result));
  }

  async updateAvatar(req: Request, res: Response) {
    req.body = JSON.parse(req.body);
    const result = await CreatorService.updateAvatar({ ...req });
    res.status(200).send(response("Woop woop! That's a beautiful profile pic!", result));
  }

  async updateEmailNotification(req: Request, res: Response) {
    req.body = JSON.parse(req.body);
    const result = await CreatorService.updateEmailNotification({ ...req });
    res.status(200).send(response("Alrighty, your notifications are updated!", result));
  }
}

export default new CreatorController();
