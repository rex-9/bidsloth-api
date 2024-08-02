import { Request, Response } from "express";

import response from "@/utilities/response";
import BidService from "@/services/bid.service";

class BidController {
  async index(req: Request, res: Response) {
    req.body = JSON.parse(req.body);
    const result = await BidService.index({ ...req });
    res.status(200).send(response("bids of an auction fetched", result));
  }
  
  async validateOrCreate(req: Request, res: Response) {
    req.body = JSON.parse(req.body);
    const result = await BidService.validateOrCreate({ ...req });
    res.status(200).send(response("bid validated or created", result));
  }
  
  async verifyAndCreate(req: Request, res: Response) {
    req.body = JSON.parse(req.body);
    const result = await BidService.verifyAndCreate({ ...req });
    res.status(200).send(response("bid verified and created", result));
  }

  async requestBidderVerification(req: Request, res: Response) {
    req.body = JSON.parse(req.body);
    const result = await BidService.requestBidderVerification({ ...req });
    res.status(200).send(response("bidder email verification requested", result));
  }
}

export default new BidController();
