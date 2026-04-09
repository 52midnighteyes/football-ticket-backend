import { Router } from "express";
import {
  getUserController,
  uploadUserAvatarController,
} from "./user.controller.js";
import { verifyAccessToken } from "../../middlewares/tokenVerification/tokenVerification.middleware.js";
import { upload } from "../../middlewares/multer.middleware.js";
import { validateSchema } from "../../middlewares/zodValidator.middleware.js";
import { uuidParamsSchema } from "../auth/auth.schemas.js";

const router = Router();

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

export default router;
