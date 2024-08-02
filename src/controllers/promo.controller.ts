import { Request, Response } from "express";

import response from "@/utilities/response";
import PromoService from "@/services/promo.service";

class PromoController {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    async index(req: Request, res: Response) {
        const result = await PromoService.index();
        res.status(200).send(response("promos fetched", result));
    }

    async find(req: Request, res: Response) {
        req.body = JSON.parse(req.body);
        const result = await PromoService.find({ ...req });
        res.status(200).send(response("promo found", result));
    }

    async createMany(req: Request, res: Response) {
        req.body = JSON.parse(req.body);
        const result = await PromoService.createMany({ ...req });
        res.status(200).send(response("promos created", result));
    }

    async createOne(req: Request, res: Response) {
        req.body = JSON.parse(req.body);
        const result = await PromoService.createOne({ ...req });
        res.status(200).send(response("a single promo created", result));
    }

    async validate(req: Request, res: Response) {
        req.body = JSON.parse(req.body);
        const result = await PromoService.validate({ ...req });
        res.status(200).send(response("promo valid", result));
    }

    async delete(req: Request, res: Response) {
        req.body = JSON.parse(req.body);
        const result = await PromoService.delete({ ...req });
        res.status(200).send(response("promo deleted", result));
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    async deleteAll(req: Request, res: Response) {
        const result = await PromoService.deleteAll();
        res.status(200).send(response("promos deleted all", result));
    }
}

export default new PromoController();
