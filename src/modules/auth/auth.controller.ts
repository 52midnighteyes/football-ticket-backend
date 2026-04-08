import type { Request, Response, NextFunction } from "express";
import type {
  TEmailParams,
  TForgotPasswordParams,
  TLoginParams,
  TRegisterParams,
  TTokenParams,
  TUpdatePassword,
} from "./auth.schemas.js";
import { refreshTokenConfig } from "../../constant/cookie-options.constant.js";
import {
  forgotPasswordRequestService,
  forgotPasswordService,
  loginService,
  logoutService,
  refreshTokenService,
  registerService,
  updatePasswordService,
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
    const { token } = req.validated?.params as TTokenParams;
    await verifyUserService(token);
    res.status(201).json({ message: "Verify success" });
  } catch (error) {
    next(error);
  }
};

export const updatePasswordController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = req.validated?.body as TUpdatePassword;
    const userId = req.user!.id;

    await updatePasswordService({ ...data, userId });

    res.status(201).json({ message: "update password successfull" });
  } catch (error) {
    next(error);
  }
};

export const forgotPasswordRequestController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email } = req.validated?.body as TEmailParams;
    await forgotPasswordRequestService(email);

    res.status(200).json({
      message:
        "If an account with that email exists, a reset link has been sent",
    });
  } catch (error) {
    next(error);
  }
};

export const forgotPasswordController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { token } = req.validated?.params as TTokenParams;
    const { newPassword } = req.validated?.body as TForgotPasswordParams;
    await forgotPasswordService(token, newPassword);

    res.status(200).json({
      message:
        "Password reset successful. You can now log in with your new password",
    });
  } catch (error) {
    next(error);
  }
};
