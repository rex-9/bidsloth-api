import { Router } from "express";
import { CONFIGS } from "@/configs";
import BidderCtrl from "@/controllers/bidder.controller";
import authGuard from "@/middlewares/auth.middleware";

const router: Router = Router();

router.get("/index", authGuard(CONFIGS.ROLES.USER), BidderCtrl.index);

// router.get("/detail", authGuard(CONFIGS.ROLES.USER), BidderCtrl.detail);

// router.post("/create", authGuard(CONFIGS.ROLES.USER), BidderCtrl.create);

// router.patch("/update", authGuard(CONFIGS.ROLES.USER), BidderCtrl.update);

export default router;
