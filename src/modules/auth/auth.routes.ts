import { Router } from "express";
import { authController } from "./auth.controller.js";
import { inputValidator } from "../../middlewares/zodValidator.middleware.js";
import { loginSchema, registerSchema } from "./auth.schema.js";
import { loginLimiter, registerLimiter } from "./auth.ratelimiter.js";

class AuthRouter {
  private router: Router;
  constructor() {
    this.router = Router();
    this.initializeRouter();
  }

  private initializeRouter() {
    this.router.post(
      "/register",
      registerLimiter,
      inputValidator.schema(registerSchema, "body"),
      authController.register,
    );

    this.router.post(
      "/login",
      // loginLimiter,
      inputValidator.schema(loginSchema, "body"),
      authController.login,
    );

    this.router.post("/refresh-token", authController.refreshToken);

    this.router.post("/logout", authController.logOut);
  }

  public getRouter() {
    return this.router;
  }
}

export const authRoutes = new AuthRouter().getRouter();
