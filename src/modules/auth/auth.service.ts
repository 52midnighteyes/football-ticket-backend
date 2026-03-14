import type { IRegisterParams } from "./auth.interface.js";
import { authRepo } from "./auth.repository.js";
import { AppError } from "../../class/appError.js";
import { userRepo } from "../user/user.repository.js";

class AuthService {
  public userRegister = async (params: IRegisterParams) => {
    try {
      const user = await userRepo.findUserByEmail(params.email);
      if (user) throw new AppError(409, "Email is already registered");

      const payload = await authRepo.createUser(params);

      return payload;
    } catch (error) {
      console.error("message:", error);
      throw error;
    }
  };
}

export const authService = new AuthService();
