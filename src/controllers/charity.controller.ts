import { Request, Response } from "express";

import response from "@/utilities/response";
import CharityService from "@/services/charity.service";

class CharityController {
  async getAll(_req: Request, res: Response) {
    const result = await CharityService.getAll();
    res.status(200).send(response("all charities fetched", result));
  }
  
  async detail(req: Request, res: Response) {
    const result = await CharityService.detail({ ...req });
    res.status(200).send(response("charity detail fetched", result));
  }
  
  async create(req: Request, res: Response) {
    req.body = JSON.parse(req.body);
    const result = await CharityService.create({ ...req });
    res.status(200).send(response("charity created", result));
  }

  async update(req: Request, res: Response) {
    req.body = JSON.parse(req.body);
    const result = await CharityService.update({ ...req });
    res.status(200).send(response("charity updated", result));
  }

  async delete(req: Request, res: Response) {
    const result = await CharityService.delete({ ...req });
    res.status(200).send(response("charity deleted", result));
  }
}

export default new CharityController();
