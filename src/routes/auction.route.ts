import { Router } from "express";
import { CONFIGS } from "@/configs";
import AuctionCtrl from "@/controllers/auction.controller";
import authGuard from "@/middlewares/auth.middleware";

const router: Router = Router();

router.get("/index", authGuard(CONFIGS.ROLES.USER), AuctionCtrl.index);

router.get("/detail", authGuard(CONFIGS.ROLES.USER), AuctionCtrl.detail);

router.get("/live/:username", AuctionCtrl.live);

router.get("/draft", authGuard(CONFIGS.ROLES.USER), AuctionCtrl.draft);

router.get("/history", authGuard(CONFIGS.ROLES.USER), AuctionCtrl.history);

router.patch("/delete-draft", authGuard(CONFIGS.ROLES.USER), AuctionCtrl.deleteDraft);

router.post("/create", authGuard(CONFIGS.ROLES.USER), AuctionCtrl.create);

router.patch("/update", authGuard(CONFIGS.ROLES.USER), AuctionCtrl.update);

router.patch("/launch", authGuard(CONFIGS.ROLES.USER), AuctionCtrl.launch);

router.patch("/deliver-prize", authGuard(CONFIGS.ROLES.USER), AuctionCtrl.deliverPrize);

router.patch("/love", authGuard(CONFIGS.ROLES.USER), AuctionCtrl.love);

router.patch("/unlove", authGuard(CONFIGS.ROLES.USER), AuctionCtrl.unlove);

export default router;
