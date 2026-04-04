import AuthController from "./auth.controller.js";
import AuthRouter from "./auth.route.js";
import { AuthRepository } from "./auth.repository.js";
import AuthService from "./auth.service.js";
import UserRepository from "../user/user.repository.js";

export class AuthModule {
  public create() {
    const userRepository = new UserRepository();
    const authRepository = new AuthRepository();
    const authService = new AuthService(userRepository, authRepository);
    const authController = new AuthController(authService);

    return {
      path: "/api/auth",
      router: new AuthRouter(authController).getRouter(),
    };
  }
}

export const createAuthRouter = () => new AuthModule().create().router;
