import { Request, Response } from "express";

import response from "@/utilities/response";
import ReplyService from "@/services/reply.service";

class ReplyController {
  async create(req: Request, res: Response) {
    req.body = JSON.parse(req.body);
    const result = await ReplyService.create({ ...req });
    res.status(200).send(response("replied to the bid", result));
  }

  async update(req: Request, res: Response) {
    req.body = JSON.parse(req.body);
    const result = await ReplyService.update({ ...req });
    res.status(200).send(response("reply updated", result));
  }
}

export default new ReplyController();
