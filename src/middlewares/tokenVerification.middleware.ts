import type { Request, Response, NextFunction } from "express";
import { AppError } from "../class/appError.js";
import Jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/config.js";
import type { IUserParams } from "../user.js";
class AuthMiddleware {
  public accessToken = async (
    req: Request,
    _res: Response,
    next: NextFunction,
  ) => {
    try {
      const authHeader = req.header("Authorization");
      if (!authHeader) throw new AppError(401, "Missing Authorization header");

      const [bearer, token] = authHeader.split(" ");
      if (!bearer || bearer.toLowerCase() !== "bearer" || !token) {
        throw new AppError(401, "Invalid Authorization header format", true);
      }

      const verification = Jwt.verify(token, JWT_SECRET);
      req.user = verification as IUserParams;

      next();
    } catch (error) {
      next(error);
    }
  };
}

export const verifyToken = new AuthMiddleware();
