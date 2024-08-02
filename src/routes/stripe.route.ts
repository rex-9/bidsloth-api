import { Router } from "express";
import { CONFIGS } from "@/configs";
import StripeCtrl from "@/controllers/stripe.controller";
import authGuard from "@/middlewares/auth.middleware";

const router: Router = Router();

router.post("/onboard", authGuard(CONFIGS.ROLES.USER), StripeCtrl.onboard);

router.put("/enable-escrow", authGuard(CONFIGS.ROLES.USER), StripeCtrl.enableEscrow);

router.get("/retrieve", authGuard(CONFIGS.ROLES.USER), StripeCtrl.retrieve);

router.get("/is-account-connected", authGuard(CONFIGS.ROLES.USER), StripeCtrl.isAccountConnected);

router.delete("/delete", authGuard(CONFIGS.ROLES.USER), StripeCtrl.delete);

router.post("/generate-checkout-url", authGuard(CONFIGS.ROLES.USER), StripeCtrl.generateCheckoutUrl);

router.get("/transactions", authGuard(CONFIGS.ROLES.USER), StripeCtrl.getTxns);

router.get("/checkout/:auctionId", StripeCtrl.getCheckoutPage);

router.get("/payout/:auctionId", StripeCtrl.releasePayout);

router.post("/webhooks", StripeCtrl.webhooks);

router.get("/get-currencies", authGuard(CONFIGS.ROLES.USER), StripeCtrl.getCurrencies);

router.get("/get-session", authGuard(CONFIGS.ROLES.USER), StripeCtrl.getSession);

export default router;
