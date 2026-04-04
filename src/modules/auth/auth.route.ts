import { Router } from "express";
import type { AuthController } from "./auth.controller.js";
import { validateSchema } from "../../middlewares/zodValidator.middleware.js";
import { loginSchema, registerUserSchema } from "./auth.schemas.js";

export const createAuthRouter = (authController: AuthController) => {
  const router = Router();

  router.post(
    "/register",
    validateSchema(registerUserSchema, "body"),
    authController.register,
  );
  router.post(
    "/login",
    validateSchema(loginSchema, "body"),
    authController.login,
  );

  router.post("/refresh-token", authController.refreshToken);

  router.post("/logout", authController.logout);

  return router;
};
