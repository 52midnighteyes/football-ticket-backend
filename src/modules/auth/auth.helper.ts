import type { User } from "../../../generated/prisma/browser.js";
import {
  JWT_SECRET,
  NODE_ENV,
  REFRESH_TOKEN_SECRET,
} from "../../config/config.js";
import type { IUserParams } from "../../custom.js";
import Jwt from "jsonwebtoken";
import { createHmac, randomBytes } from "node:crypto";

export const generateAccessToken = (params: IUserParams) => {
  return Jwt.sign(params, JWT_SECRET, {
    expiresIn: NODE_ENV === "production" ? "15m" : "24h",
  });
};

export const generateRefreshToken = () => {
  const refreshToken = randomBytes(32).toString("hex");
  const hashedToken = createHmac("sha256", REFRESH_TOKEN_SECRET)
    .update(refreshToken)
    .digest("hex");

  return { refreshToken, hashedToken };
};

export const hashToken = (token: string) => {
  return createHmac("sha256", REFRESH_TOKEN_SECRET).update(token).digest("hex");
};

export const toUserPayload = (params: User): IUserParams => {
  return {
    id: params.id,
    email: params.email,
    firstName: params.firstName,
    lastName: params.lastName,
    role: params.role,
  };
};
