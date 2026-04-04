import { Router } from "express";
import { validateSchema } from "../../middlewares/zodValidator.middleware.js";
import { loginSchema, registerUserSchema } from "./auth.schemas.js";
import {
  loginController,
  logoutController,
  refreshTokenController,
  registerController,
} from "./auth.controller.js";

const router = Router();

router.post(
  "/register",
  validateSchema(registerUserSchema, "body"),
  registerController
);

router.post("/login", validateSchema(loginSchema, "body"), loginController);

router.post("/refresh-token", refreshTokenController);

router.post("/logout", logoutController);

export default router;
