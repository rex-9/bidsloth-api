import { Router } from "express";
import { CONFIGS } from "@/configs";
import CharityCtrl from "@/controllers/charity.controller";
import authGuard from "@/middlewares/auth.middleware";

const router: Router = Router();

router.get("/", authGuard(CONFIGS.ROLES.USER), CharityCtrl.getAll);

router.get("/:id", authGuard(CONFIGS.ROLES.USER), CharityCtrl.detail);

router.post("/", CharityCtrl.create);

router.patch("/:id", CharityCtrl.update);

router.delete("/:id", CharityCtrl.delete);

export default router;
