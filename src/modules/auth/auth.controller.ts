import type { Request, Response, NextFunction } from "express";
import type { TLoginParams, TRegisterParams } from "./auth.schemas.js";
import { refreshTokenConfig } from "../../constant/cookie-options.constant.js";
import {
  loginService,
  logoutService,
  refreshTokenService,
  registerService,
  verifyUserService,
} from "./auth.service.js";

export const registerController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const payload = req.validated?.body;
    const bool = await registerService(payload as TRegisterParams);

    res.status(201).json({
      message: bool
        ? "Register success"
        : "Register success, verification email was not sent",
    });
  } catch (error) {
    next(error);
  }
};

export const loginController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const payload = req.validated?.body as TLoginParams;
    const { data, refreshToken } = await loginService(payload);

    res.cookie("refreshToken", refreshToken, refreshTokenConfig);

    res.status(200).json({ message: "Login success", data });
  } catch (error) {
    next(error);
  }
};

export const refreshTokenController = async (
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

    const { refreshToken, data } = await refreshTokenService(oldRefreshToken);

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

export const logoutController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const oldRefreshToken = req.cookies.refreshToken;
    if (!oldRefreshToken) {
      res.clearCookie("refreshToken", refreshTokenConfig);
      return res.status(200).json({ message: "logout successfull!" });
    }
    await logoutService(oldRefreshToken);

    res.clearCookie("refreshToken", refreshTokenConfig);
    res.status(200).json({ message: "logout successfull!" });
  } catch (error) {
    next(error);
  }
};

export const verifyUserController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { token } = req.validated?.params as { token: string };
    await verifyUserService(token);
    res.status(201).json({ message: "Verify success" });
  } catch (error) {
    next(error);
  }
};
