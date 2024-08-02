import { Request, Response } from "express";

import response from "@/utilities/response";
import IdeaService from "@/services/idea.service";

class IdeaController {
  async index(_req: Request, res: Response) {
    const result = await IdeaService.index();
    res.status(200).send(response("all ideas fetched", result));
  }

  async creatorIdeas(req: Request, res: Response) {
    const result = await IdeaService.creatorIdeas({ ...req });
    res.status(200).send(response("ideas of a creator fetched", result));
  }
  
  async detail(req: Request, res: Response) {
    const result = await IdeaService.detail({ ...req });
    res.status(200).send(response("idea detail fetched", result));
  }
  
  async generate(req: Request, res: Response) {
    req.body = JSON.parse(req.body);
    const result = await IdeaService.generate({ ...req });
    res.status(200).send(response("idea generated", result));
  }

  async delete(req: Request, res: Response) {
    const result = await IdeaService.delete({ ...req });
    res.status(200).send(response("idea deleted", result));
  }
}

export default new IdeaController();
