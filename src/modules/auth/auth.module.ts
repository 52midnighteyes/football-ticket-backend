import { createAuthController } from "./auth.controller.js";
import { createAuthRouter } from "./auth.route.js";
import { createAuthRepository } from "./auth.repository.js";
import { createAuthService } from "./auth.service.js";
import { createUserRepository } from "../user/user.repository.js";

export const createAuthModule = () => {
  const userRepository = createUserRepository();
  const authRepository = createAuthRepository();
  const authService = createAuthService({
    userRepo: userRepository,
    authRepo: authRepository,
  });
  const authController = createAuthController(authService);

  return {
    path: "/api/auth",
    router: createAuthRouter(authController),
  };
};

export const getAuthRouter = () => createAuthModule().router;
