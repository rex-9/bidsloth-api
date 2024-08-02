import express, { Router, Request, Response } from "express";

import authRoutes from "@/routes/auth.route";
import coreRoutes from "@/routes/core.route";
import creatorRoutes from "@/routes/creator.route";
import auctionRoutes from "@/routes/auction.route";
import bidRoutes from "@/routes/bid.route";
import stripeRoutes from "@/routes/stripe.route";
import replyRoutes from "@/routes/reply.route";
import promoRoutes from "@/routes/promo.route";
import ideaRoutes from "@/routes/idea.route";
import ratingRoutes from "@/routes/rating.route";
import charityRoutes from "@/routes/charity.route";

const router: Router = express.Router();

router.use("/auth", authRoutes);

router.use("/core", coreRoutes);

router.use("/creators", creatorRoutes);

router.use("/auctions", auctionRoutes);

router.use("/bids", bidRoutes);

router.use("/stripe", stripeRoutes);

router.use("/replies", replyRoutes);

router.use("/promos", promoRoutes);

router.use("/ideas", ideaRoutes);

router.use("/ratings", ratingRoutes);

router.use("/charities", charityRoutes);

router.get("/", (_req: Request, res: Response) => {
    return res.status(200).json({ message: "Hello world from Bo!!" });
});

// playground: can be used to test routes and other stuffs in development mode
if (process.env.NODE_ENV === "development") {
    router.use("/playground", async (_req: Request, res: Response) => {
        const results: any = {};
        res.json(results);
    });
}

export default router;
