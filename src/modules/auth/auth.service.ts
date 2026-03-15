import type { ILoginParams, IRegisterParams } from "./auth.interface.js";
import { authRepo } from "./auth.repository.js";
import { AppError } from "../../class/appError.js";
import { userRepo } from "../user/user.repository.js";
import argon2d from "argon2";
import type { IUserParams } from "../../user.js";

import Jwt from "jsonwebtoken";
import { JWT_SECRET } from "../../config/config.js";
class AuthService {
  public Register = async (params: IRegisterParams) => {
    try {
      const user = await userRepo.findUserByEmail(params.email);
      if (user) throw new AppError(409, "Email is already registered");

      const hashedPassword = await argon2d.hash(params.password);
      const payload = { ...params, password: hashedPassword };

      const safeUser = await authRepo.createUser(payload);

      return { user: safeUser };
    } catch (error) {
      console.error("message:", error);
      throw error;
    }
  };

  public Login = async (params: ILoginParams) => {
    try {
      const user = await userRepo.findUserByEmail(params.email);
      if (!user) throw new AppError(400, "Invalid email or password");

      const isMatch = await argon2d.verify(user.password, params.password);
      if (!isMatch) throw new AppError(400, "Invalid email or password");

      const safeUser: IUserParams = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      };

      const token = Jwt.sign(safeUser, JWT_SECRET, { expiresIn: "24h" });

      return { token, user: safeUser };
    } catch (error) {
      console.error("message:", error);
      throw error;
    }
  };
}

export const authService = new AuthService();
