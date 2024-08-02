import { Router } from "express";
import { CONFIGS } from "@/configs";
import RatingCtrl from "@/controllers/rating.controller";
import authGuard from "@/middlewares/auth.middleware";

const router: Router = Router();

router.get("/", authGuard(CONFIGS.ROLES.USER), RatingCtrl.getAll);

router.get("/auction/:auctionId", authGuard(CONFIGS.ROLES.USER), RatingCtrl.getOne);

router.get("/creator/:creatorId", authGuard(CONFIGS.ROLES.USER), RatingCtrl.getAllOfCreator);

router.get("/bidder/:bidderId", authGuard(CONFIGS.ROLES.USER), RatingCtrl.getAllOfBidder);

router.post("/", authGuard(CONFIGS.ROLES.USER), RatingCtrl.create);

router.patch("/:id", authGuard(CONFIGS.ROLES.USER), RatingCtrl.update);

router.delete("/:id", authGuard(CONFIGS.ROLES.USER), RatingCtrl.delete);

router.delete("/", authGuard(CONFIGS.ROLES.USER), RatingCtrl.deleteAll);

export default router;
