import { Router } from "express";
import { CONFIGS } from "@/configs";
import IdeaCtrl from "@/controllers/idea.controller";
import authGuard from "@/middlewares/auth.middleware";

const router: Router = Router();

router.get("/", authGuard(CONFIGS.ROLES.USER), IdeaCtrl.index);

router.get("/of-creator/:creatorId", authGuard(CONFIGS.ROLES.USER), IdeaCtrl.creatorIdeas);

router.get("/:id", authGuard(CONFIGS.ROLES.USER), IdeaCtrl.detail);

router.post("/generate", authGuard(CONFIGS.ROLES.USER), IdeaCtrl.generate);

router.delete("/:id", authGuard(CONFIGS.ROLES.USER), IdeaCtrl.delete);

export default router;
