import { createAuthModule } from "./auth/auth.module.js";
import type { AppModule } from "../types/module.type.js";

export const createModules = (): AppModule[] => {
  return [createAuthModule()];
};
