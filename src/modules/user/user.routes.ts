import { Router } from "express";
import {
  checkUserByEmailController,
  checkUserByReferralCodeController,
  getUserController,
  uploadUserAvatarController,
} from "./user.controller.js";
import { verifyAccessToken } from "../../middlewares/tokenVerification/tokenVerification.middleware.js";
import { upload } from "../../middlewares/multer.middleware.js";
import { validateSchema } from "../../middlewares/zodValidator.middleware.js";
import { emailSchema, uuidParamsSchema } from "../auth/auth.schemas.js";
import { referralCodeParamsSchema } from "./user.schemas.js";

const router = Router();

router.post(
  "/check-email",
  validateSchema(emailSchema, "body"),
  checkUserByEmailController,
);

router.get(
  "/:id",
  validateSchema(uuidParamsSchema, "params"),
  getUserController,
);

router.post(
  "/avatar",
  verifyAccessToken,
  upload.single("avatar"),
  uploadUserAvatarController,
);

router.get(
  "/referral/:referralCode",
  validateSchema(referralCodeParamsSchema, "params"),
  checkUserByReferralCodeController,
);

export default router;
