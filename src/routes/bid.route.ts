import { Router } from "express";
import { CONFIGS } from "@/configs";
import BidCtrl from "@/controllers/bid.controller";
import authGuard from "@/middlewares/auth.middleware";

const router: Router = Router();

router.get("/index", authGuard(CONFIGS.ROLES.USER), BidCtrl.index);

router.post("/validate-or-create", BidCtrl.validateOrCreate);

router.post("/verify-and-create", BidCtrl.verifyAndCreate);

router.post("/request-bidder-verification", BidCtrl.requestBidderVerification);

export default router;
