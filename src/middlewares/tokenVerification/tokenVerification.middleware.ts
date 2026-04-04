import type { Request, Response, NextFunction } from "express";
import { createAppError } from "../../class/appError.js";
import Jwt from "jsonwebtoken";
import { JWT_SECRET } from "../../config/config.js";
import type { IUserParams } from "../../custom.js";
import { accessTokenSchema } from "./tokenVerification.schema.js";

export const verifyAccessToken = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.header("Authorization");
    if (!authHeader) {
      throw createAppError(401, "Missing Authorization header");
    }

    const [bearer, token] = authHeader.split(" ");
    if (!bearer || bearer.toLowerCase() !== "bearer" || !token) {
      throw createAppError(401, "Invalid Authorization header format", true);
    }

    const verification = accessTokenSchema.parse(Jwt.verify(token, JWT_SECRET));

    req.user = verification as IUserParams;

    next();
  } catch (error) {
    next(error);
  }
};

export const verifyToken = {
  accessToken: verifyAccessToken,
};
