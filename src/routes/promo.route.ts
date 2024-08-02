import { Router } from "express";
import { CONFIGS } from "@/configs";
import PromoCtrl from "@/controllers/promo.controller";
import authGuard from "@/middlewares/auth.middleware";

const router: Router = Router();

router.get("/index", PromoCtrl.index);

router.get("/find", PromoCtrl.find);

router.post("/create-many", PromoCtrl.createMany);

router.post("/create-one", PromoCtrl.createOne);

router.post("/validate", PromoCtrl.validate);

router.delete("/delete", authGuard(CONFIGS.ROLES.USER), PromoCtrl.delete);

router.delete("/delete-all", PromoCtrl.deleteAll);

export default router;
