import { Router } from "express";
import { CONFIGS } from "@/configs";
import CreatorCtrl from "@/controllers/creator.controller";
import authGuard from "@/middlewares/auth.middleware";

const router: Router = Router();

router.get("/get-current-user", authGuard(CONFIGS.ROLES.USER), CreatorCtrl.getCurrentUser);

router.get("/detail", authGuard(CONFIGS.ROLES.USER), CreatorCtrl.getCreator);

router.get("/confirm/:username", CreatorCtrl.confirm);

router.delete("/delete", authGuard(CONFIGS.ROLES.USER), CreatorCtrl.delete);

router.patch("/update-profile", authGuard(CONFIGS.ROLES.USER), CreatorCtrl.updateProfile);

router.patch("/update-password", authGuard(CONFIGS.ROLES.USER), CreatorCtrl.updatePassword);

router.patch("/update-avatar", authGuard(CONFIGS.ROLES.USER), CreatorCtrl.updateAvatar);

router.patch("/update-email-settings", authGuard(CONFIGS.ROLES.USER), CreatorCtrl.updateEmailNotification);

export default router;
