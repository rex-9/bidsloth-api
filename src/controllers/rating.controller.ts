import { Request, Response } from "express";

import response from "@/utilities/response";
import RatingService from "@/services/rating.service";

class BidController {
  async getAll(_req: Request, res: Response) {
    const result = await RatingService.getAll();
    res.status(200).send(response("all ratings fetched", result));
  }
  
  async getOne(req: Request, res: Response) {
    const result = await RatingService.getOne({ ...req });
    res.status(200).send(response("rating of an auction fetched", result));
  }
  
  async getAllOfCreator(req: Request, res: Response) {
    const result = await RatingService.getAllOfCreator({ ...req });
    res.status(200).send(response("ratings of a creator fetched", result));
  }

  async getAllOfBidder(req: Request, res: Response) {
    const result = await RatingService.getAllOfBidder({ ...req });
    res.status(200).send(response("ratings of a bidder fetched", result));
  }

  async create(req: Request, res: Response) {
    req.body = JSON.parse(req.body);
    const result = await RatingService.create({ ...req });
    res.status(200).send(response("rating created", result));
  }

  async update(req: Request, res: Response) {
    req.body = JSON.parse(req.body);
    const result = await RatingService.update({ ...req });
    res.status(200).send(response("rating updated", result));
  }

  async delete(req: Request, res: Response) {
    const result = await RatingService.delete({ ...req });
    res.status(200).send(response("rating deleted", result));
  }

  async deleteAll(_req: Request, res: Response) {
    const result = await RatingService.deleteAll();
    res.status(200).send(response("all rating deleted", result));
  }
}

export default new BidController();
