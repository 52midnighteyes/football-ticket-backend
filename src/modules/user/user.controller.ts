import { Response, Request, NextFunction } from "express";
import { TEmailParams, TUuidParams } from "../auth/auth.schemas.js";
import {
  checkUserByEmailService,
  checkUserByReferralCodeService,
  getUserService,
  meService,
  uploadUserAvatarService,
} from "./user.service.js";
import { AppError } from "../../class/appError.js";

export const getUserController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.validated?.params as TUuidParams;
    const data = await getUserService(id);
    res.status(200).json({
      status: "success",
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const uploadUserAvatarController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { file } = req;
    if (!file) throw new AppError(400, "No file uploaded");
    const id = req.user?.id as string;
    const data = await uploadUserAvatarService(id, file);
    res.status(200).json({
      message: "Avatar uploaded successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const checkUserByReferralCodeController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { referralCode } = req.validated?.params as { referralCode: string };
    const result = await checkUserByReferralCodeService(referralCode);
    if (result === 1) {
      res.status(200).json({
        message: "Referral code is valid",
      });
    } else {
      res.status(200).json({
        message: "Referral code is invalid",
      });
    }
  } catch (error) {
    next(error);
  }
};

export const checkUserByEmailController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = req.validated?.body as TEmailParams;
    const result = await checkUserByEmailService(email);
    if (result === 1) {
      res.status(200).json({
        message: "Email is already in use",
      });
    } else {
      res.status(200).json({
        message: "Email is available",
      });
    }
  } catch (error) {
    next(error);
  }
};

export const meController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.user?.id as string;
    const data = await meService(id);
    res.status(200).json({
      status: "success",
      data,
    });
  } catch (error) {
    next(error);
  }
};
