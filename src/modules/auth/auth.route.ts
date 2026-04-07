import { Router } from "express";
import { validateSchema } from "../../middlewares/zodValidator.middleware.js";
import {
  loginSchema,
  registerUserSchema,
  verifyParamsSchema,
} from "./auth.schemas.js";
import {
  loginController,
  logoutController,
  refreshTokenController,
  registerController,
  verifyUserController,
} from "./auth.controller.js";

const router = Router();

router.post(
  "/register",
  validateSchema(registerUserSchema, "body"),
  registerController,
);

router.post("/login", validateSchema(loginSchema, "body"), loginController);

router.post("/refresh-token", refreshTokenController);

router.post("/logout", logoutController);

router.post(
  "/verify/:token",
  validateSchema(verifyParamsSchema, "params"),
  verifyUserController,
);

export default router;
