import { Router } from "express";
import { CONFIGS } from "@/configs";
import ReplyCtrl from "@/controllers/reply.controller";
import authGuard from "@/middlewares/auth.middleware";

const router: Router = Router();

router.post("/create", authGuard(CONFIGS.ROLES.USER), ReplyCtrl.create);

router.patch("/update", authGuard(CONFIGS.ROLES.USER), ReplyCtrl.update);

export default router;
