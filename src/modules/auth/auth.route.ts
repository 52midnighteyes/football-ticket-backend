import { Router } from "express";
import AuthController from "./auth.controller.js";
import { inputValidator } from "../../middlewares/zodValidator.middleware.js";
import { loginSchema, registerUserSchema } from "./auth.schemas.js";

export default class AuthRouter {
  private router: Router;
  constructor(private authController: AuthController) {
    this.router = Router();
    this.initializeRouter();
  }

  private initializeRouter = () => {
    this.router.post(
      "/register",
      inputValidator.schema(registerUserSchema, "body"),
      this.authController.register,
    );
    this.router.post(
      "/login",
      inputValidator.schema(loginSchema, "body"),
      this.authController.login,
    );

    this.router.post("/refresh-token", this.authController.refreshToken);

    this.router.post("/logout", this.authController.logout);
  };
  public getRouter() {
    return this.router;
  }
}
