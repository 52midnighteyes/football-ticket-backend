import type { Request, Response, NextFunction } from "express";
import type { AuthService } from "./auth.service.js";
import type { TLoginParams, TRegisterParams } from "./auth.schemas.js";
import { refreshTokenConfig } from "../../constant/cookie-options.constant.js";

export const createAuthController = (authService: AuthService) => {
  const register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const payload = req.validated?.body as TRegisterParams;
      const data = await authService.register(payload);

      res.status(201).json({ message: "Register success", data });
    } catch (error) {
      next(error);
    }
  };

  const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const payload = req.validated?.body as TLoginParams;
      const { data, refreshToken } = await authService.login(payload);

      res.cookie("refreshToken", refreshToken, refreshTokenConfig);

      res.status(200).json({ message: "Login success", data });
    } catch (error) {
      next(error);
    }
  };

  const refreshToken = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const oldRefreshToken = req.cookies.refreshToken;

      if (!oldRefreshToken) {
        res.clearCookie("refreshToken", refreshTokenConfig);
        return res.status(401).json({ message: "Invalid refresh token" });
      }

      const { refreshToken, data } =
        await authService.refreshToken(oldRefreshToken);

      if (!refreshToken) {
        res.clearCookie("refreshToken", refreshTokenConfig);
        return res.status(401).json({ message: "Invalid refresh token" });
      }

      res.cookie("refreshToken", refreshToken, refreshTokenConfig);
      res.status(200).json({ message: "Token refreshed successfully", data });
    } catch (error) {
      next(error);
    }
  };

  const logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const oldRefreshToken = req.cookies.refreshToken;
      if (!oldRefreshToken) {
        res.clearCookie("refreshToken", refreshTokenConfig);
        return res.status(200).json({ message: "logout successfull!" });
      }
      await authService.logout(oldRefreshToken);

      res.clearCookie("refreshToken", refreshTokenConfig);
      res.status(200).json({ message: "logout successfull!" });
    } catch (error) {
      next(error);
    }
  };

  return {
    register,
    login,
    refreshToken,
    logout,
  };
};

export type AuthController = ReturnType<typeof createAuthController>;
