import { Request, Response } from "express";

import response from "@/utilities/response";
import StripeService from "@/services/stripe.service";

class StripeController {
    async onboard(req: Request, res: Response) {
        req.body = JSON.parse(req.body);
        const result = await StripeService.onboard({ ...req });
        res.status(200).send(response("creator onboarded on stripe", result));
    }

    async enableEscrow(req: Request, res: Response) {
        req.body = JSON.parse(req.body);
        const result = await StripeService.enableEscrow({ ...req });
        res.status(200).send(response("creator updated on stripe to meet escrow requirements", result));
    }

    async isAccountConnected(req: Request, res: Response) {
        const result = await StripeService.isAccountConnected({ ...req });
        res.status(200).send(response("creator successfully connected with stripe", result));
    }

    async retrieve(req: Request, res: Response) {
        req.body = JSON.parse(req.body);
        const result = await StripeService.retrieve({ ...req });
        res.status(200).send(response("creator fetched from stripe", result));
    }

    async delete(req: Request, res: Response) {
        req.body = JSON.parse(req.body);
        const result = await StripeService.delete({ ...req });
        res.status(200).send(response("creator deleted from stripe", result));
    }

    async generateCheckoutUrl(req: Request, res: Response) {
        req.body = JSON.parse(req.body);
        const result = await StripeService.generateCheckoutUrl({ ...req });
        res.status(200).send(response("stripe session created", result));
    }

    async getCheckoutPage(req: Request, res: Response) {
        const result = (await StripeService.getCheckoutPage({ ...req })) as string;
        res.redirect(result);
    }

    async releasePayout(req: Request, res: Response) {
        const result = (await StripeService.releasePayout({ ...req })) as string;
        res.redirect(result);
        // res.status(200).send(response("payout released", result));
    }

    async getTxns(req: Request, res: Response) {
        const result = await StripeService.getTxns({ ...req });
        res.status(200).send(response("transactions of the creator retrieved", result));
    }

    async webhooks(req: Request, res: Response) {
        const result = await StripeService.webhooks(req);
        res.status(200).send(response("webhooks successfully received", result));
    }

    async getCurrencies(req: Request, res: Response) {
        req.body = JSON.parse(req.body);
        const result = await StripeService.getCurrencies();
        res.status(200).send(response("available stripe currencies created", result));
    }

    async getSession(req: Request, res: Response) {
        req.body = JSON.parse(req.body);
        const result = await StripeService.getSession({ ...req });
        res.status(200).send(response("stripe session retrieved", result));
    }
}

export default new StripeController();
