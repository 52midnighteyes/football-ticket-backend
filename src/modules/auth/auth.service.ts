import argon2d from "argon2";
import type { IUserParams } from "../../custom.js";
import type { TLoginParams, TRegisterParams } from "./auth.schemas.js";
import {
  generateAccessToken,
  generateRefreshToken,
  hashToken,
  toUserPayload,
} from "./auth.helper.js";
import {
  createRefreshToken,
  deleteRefreshTokenByHashedToken,
  findRefreshTokenByHashedToken,
} from "./auth.repository.js";
import { FOURTEEN_DAYS_IN_MS } from "../../constant/time.constant.js";
import type { TPrisma } from "../../libs/prisma/prisma.types.js";
import { prisma } from "../../libs/prisma/prisma.lib.js";
import { createUser, findUserByEmail } from "../user/user.repository.js";
import { AppError } from "../../class/appError.js";

export const registerService = async (params: TRegisterParams) => {
  const checkUser = await findUserByEmail(params.email);
  if (checkUser) {
    throw new AppError(409, "Email is already registered");
  }

  const hashedPass = await argon2d.hash(params.password);
  const createdUser = await createUser({
    ...params,
    password: hashedPass,
  });

  const user = toUserPayload(createdUser);

  return {
    accessToken: generateAccessToken(user),
    user,
  };
};

export const loginService = async (params: TLoginParams) => {
  const user = await findUserByEmail(params.email);
  if (!user) {
    throw new AppError(401, "Invalid email or password");
  }

  const isMatch = await argon2d.verify(user.password, params.password);
  if (!isMatch) {
    throw new AppError(401, "Invalid email or password");
  }

  const payload: IUserParams = toUserPayload(user);

  const accessToken = generateAccessToken(payload);

  const { refreshToken, hashedToken } = generateRefreshToken();
  const refreshPayload = {
    userId: user.id,
    hashedToken,
    expiresAt: new Date(Date.now() + FOURTEEN_DAYS_IN_MS),
  };

  await createRefreshToken(refreshPayload);

  return {
    refreshToken,
    data: { accessToken, user: payload },
  };
};

export const refreshTokenService = async (oldRefreshToken: string) => {
  try {
    const oldHashedToken = hashToken(oldRefreshToken);
    const checkToken = await findRefreshTokenByHashedToken(oldHashedToken);

    if (!checkToken) {
      return {
        refreshToken: "",
        data: null,
      };
    }

    const payload = toUserPayload(checkToken.user);

    const { hashedToken, refreshToken } = generateRefreshToken();
    const refreshTokenPayload = {
      userId: checkToken.userId,
      hashedToken,
      expiresAt: new Date(Date.now() + FOURTEEN_DAYS_IN_MS),
    };

    await prisma.$transaction(async (tx) => {
      await deleteRefreshTokenByHashedToken(oldHashedToken, tx);
      await createRefreshToken(refreshTokenPayload, tx);
    });

    return {
      refreshToken,
      data: {
        accessToken: generateAccessToken(payload),
        user: payload,
      },
    };
  } catch (error) {
    throw error;
  }
};

export const logoutService = async (oldRefreshToken: string) => {
  try {
    const oldHashedToken = hashToken(oldRefreshToken);
    const checkToken = findRefreshTokenByHashedToken(oldHashedToken);
    if (!checkToken) return;

    await deleteRefreshTokenByHashedToken(oldHashedToken);

    return;
  } catch (error) {
    console.error("Failed to delete refresh token during logout:", error);
    return;
  }
};
