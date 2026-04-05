import AuthRouter from "./auth/auth.route.js";
import type { AppModule } from "../types/module.type.js";

export const createModules = (): AppModule[] => {
  return [
    {
      path: "/api/auth",
      router: AuthRouter,
    },
  ];
};
