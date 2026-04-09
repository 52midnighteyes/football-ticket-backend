import { Response, Request, NextFunction } from "express";
import { TUuidParams } from "../auth/auth.schemas.js";
import { getUserService, uploadUserAvatarService } from "./user.service.js";

export const getUserController = async (
  req: Request,
  res: Response,
  next: NextFunction,
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
  next: NextFunction,
) => {
  try {
    const { file } = req;
    const id = req.user?.id as string;
    await uploadUserAvatarService(id, file!);
    res.status(200).json({
      status: "success",
      message: "Avatar uploaded successfully",
    });
  } catch (error) {
    next(error);
  }
};
