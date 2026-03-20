import type {
  ICreateRefreshTokenDbParams,
  ILoginParams,
  IRegisterParams,
} from "./auth.interface.js";
import { authRepo } from "./auth.repository.js";
import { AppError } from "../../class/appError.js";
import { userRepo } from "../user/user.repository.js";
import argon2d from "argon2";
import type { IUserParams } from "../../custom.js";

import { AuthHelper } from "./auth.helper.js";
class AuthService {
  public Register = async (params: IRegisterParams) => {
    try {
      const isUserExists = await userRepo.findUserByEmail(params.email);
      if (isUserExists) throw new AppError(409, "Email is already registered");

      const hashedPassword = await argon2d.hash(params.password);
      const payload = { ...params, password: hashedPassword };

      const user = await authRepo.createUser(payload);

      return user;
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

      const accessToken = AuthHelper.generateAccessToken(safeUser);
      const { refreshToken, hashedToken } = AuthHelper.generateRefreshToken();
      const fourteenDaysInMs = 1000 * 60 * 60 * 24 * 14;
      const refreshTokenPayload: ICreateRefreshTokenDbParams = {
        userId: user.id,
        hashedToken,
        expiresAt: new Date(Date.now() + fourteenDaysInMs),
      };

      await authRepo.createRefreshToken(refreshTokenPayload);

      const payload = {
        cookie: {
          refreshToken,
          maxAge: fourteenDaysInMs,
        },
        data: {
          accessToken,
          user: safeUser,
        },
      };

      return payload;
    } catch (error) {
      console.error("message:", error);
      throw error;
    }
  };

  public refreshToken = async (refreshToken: string) => {
    try {
      const hashedRefreshToken = AuthHelper.tokenHasher(refreshToken);
      const existingRefreshToken =
        await authRepo.findHashedToken(hashedRefreshToken);

      if (!existingRefreshToken) {
        throw new AppError(401, "Refresh token is invalid or expired");
      }

      const user = await userRepo.findUserById(existingRefreshToken.userId);

      if (!user) {
        throw new AppError(404, "User not found or deleted");
      }

      const safeUser: IUserParams = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      };

      const newAccessToken = AuthHelper.generateAccessToken(safeUser);

      const {
        refreshToken: newRefreshToken,
        hashedToken: newHashedRefreshToken,
      } = AuthHelper.generateRefreshToken();

      const refreshTokenTtlMs = 1000 * 60 * 60 * 24 * 14;

      const newRefreshTokenData: ICreateRefreshTokenDbParams = {
        userId: user.id,
        hashedToken: newHashedRefreshToken,
        expiresAt: new Date(Date.now() + refreshTokenTtlMs),
      };

      await authRepo.rotateRefreshToken(
        hashedRefreshToken,
        newRefreshTokenData,
      );

      return {
        cookie: {
          refreshToken: newRefreshToken,
          maxAge: refreshTokenTtlMs,
        },
        data: {
          accessToken: newAccessToken,
        },
      };
    } catch (error) {
      console.error("message:", error);
      throw error;
    }
  };

  public logOut = async (refreshToken: string) => {
    try {
      const hashedToken = AuthHelper.tokenHasher(refreshToken);
      await authRepo.deleteRefreshTokenOnLogOut(hashedToken);
    } catch (error) {
      console.error("message:", error);
      throw error;
    }
  };
}

export const authService = new AuthService();
