import { Request, Response } from "express";

import response from "@/utilities/response";
import BidderService from "@/services/bidder.service";

class BidderController {
  async index(req: Request, res: Response) {
    req.body = JSON.parse(req.body);
    const result = await BidderService.index({ ...req });
    res.status(200).send(response("bidders fetched", result));
  }
}

export default new BidderController();
