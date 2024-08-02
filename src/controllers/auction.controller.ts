import { Request, Response } from "express";

import response from "@/utilities/response";
import AuctionService from "@/services/auction.service";

class AuctionController {
    async index(req: Request, res: Response) {
        req.body = JSON.parse(req.body);
        const result = await AuctionService.index({ ...req });
        res.status(200).send(response("auctions of a single creator fetched", result));
    }

    async history(req: Request, res: Response) {
        const result = await AuctionService.history({ ...req });
        res.status(200).send(response("auction histories of a single creator fetched", result));
    }

    async deliverPrize(req: Request, res: Response) {
        req.body = JSON.parse(req.body);
        const result = await AuctionService.deliverPrize({ ...req });
        res.status(200).send(response("prize delivered", result));
    }

    async detail(req: Request, res: Response) {
        req.body = JSON.parse(req.body);
        const result = await AuctionService.detail({ ...req });
        res.status(200).send(response("auction fetched", result));
    }

    async live(req: Request, res: Response) {
        const result = await AuctionService.live(req.params.username);
        res.status(200).send(response("live auction fetched", result));
    }

    async draft(req: Request, res: Response) {
        // req.body = JSON.parse(req.body);
        const result = await AuctionService.draft({ ...req });
        res.status(200).send(response("auction fetched", result));
    }

    async deleteDraft(req: Request, res: Response) {
        req.body = JSON.parse(req.body);
        const result = await AuctionService.deleteDraft({ ...req });
        res.status(200).send(response("draft deleted", result));
    }

    async create(req: Request, res: Response) {
        req.body = JSON.parse(req.body);
        const result = await AuctionService.create({ ...req });
        res.status(200).send(response("auction created", result));
    }

    async update(req: Request, res: Response) {
        req.body = JSON.parse(req.body);
        const result = await AuctionService.update({ ...req });
        res.status(200).send(response("auction updated", result));
    }

    async launch(req: Request, res: Response) {
        req.body = JSON.parse(req.body);
        const result = await AuctionService.launch({ ...req });
        res.status(200).send(response("auction launched successfully", result));
    }

    async love(req: Request, res: Response) {
        req.body = JSON.parse(req.body);
        const result = await AuctionService.love({ ...req }, true);
        res.status(200).send(response("auction loveed successfully", result));
    }

    async unlove(req: Request, res: Response) {
        req.body = JSON.parse(req.body);
        const result = await AuctionService.love({ ...req }, false);
        res.status(200).send(response("auction unloved successfully", result));
    }
}

export default new AuctionController();
