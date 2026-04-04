import argon2d from "argon2";
import { createAppError } from "../../class/appError.js";
import type { IUserParams } from "../../custom.js";
import type { TLoginParams, TRegisterParams } from "./auth.schemas.js";
import type { UserRepository } from "../user/user.repository.js";
import {
  generateAccessToken,
  generateRefreshToken,
  hashToken,
  toUserPayload,
} from "./auth.helper.js";
import type { AuthRepository } from "./auth.repository.js";
import { FOURTEEN_DAYS_IN_MS } from "../../constant/time.constant.js";
import type { TPrisma } from "../../libs/prisma/prisma.types.js";
import { prisma } from "../../libs/prisma/prisma.lib.js";

type CreateAuthServiceParams = {
  userRepo: UserRepository;
  authRepo: AuthRepository;
  db?: TPrisma;
};

export const createAuthService = ({
  userRepo,
  authRepo,
  db = prisma,
}: CreateAuthServiceParams) => {
  const register = async (params: TRegisterParams) => {
    const checkUser = await userRepo.findUserByEmail(params.email);
    if (checkUser) {
      throw createAppError(409, "Email is already registered");
    }

    const hashedPass = await argon2d.hash(params.password);
    const createdUser = await userRepo.createUser({
      ...params,
      password: hashedPass,
    });

    const user = toUserPayload(createdUser);

    return {
      accessToken: generateAccessToken(user),
      user,
    };
  };

  const login = async (params: TLoginParams) => {
    const user = await userRepo.findUserByEmail(params.email);
    if (!user) {
      throw createAppError(401, "Invalid email or password");
    }

    const isMatch = await argon2d.verify(user.password, params.password);
    if (!isMatch) {
      throw createAppError(401, "Invalid email or password");
    }

    const payload: IUserParams = toUserPayload(user);

    const accessToken = generateAccessToken(payload);

    const { refreshToken, hashedToken } = generateRefreshToken();
    const refreshPayload = {
      userId: user.id,
      hashedToken,
      expiresAt: new Date(Date.now() + FOURTEEN_DAYS_IN_MS),
    };

    await authRepo.createRefreshToken(refreshPayload);

    return {
      refreshToken,
      data: { accessToken, user: payload },
    };
  };

  const refreshToken = async (oldRefreshToken: string) => {
    try {
      const oldHashedToken = hashToken(oldRefreshToken);
      const checkToken = await authRepo.findRefreshTokenByHashedToken(
        oldHashedToken,
      );

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

      await db.$transaction(async (tx) => {
        await authRepo.deleteRefreshTokenByHashedToken(oldHashedToken, tx);
        await authRepo.createRefreshToken(refreshTokenPayload, tx);
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

  const logout = async (oldRefreshToken: string) => {
    try {
      const oldHashedToken = hashToken(oldRefreshToken);
      const checkToken = await authRepo.findRefreshTokenByHashedToken(
        oldHashedToken,
      );
      if (!checkToken) return;

      await authRepo.deleteRefreshTokenByHashedToken(oldHashedToken);

      return;
    } catch (error) {
      console.error("Failed to delete refresh token during logout:", error);
      return;
    }
  };

  return {
    register,
    login,
    refreshToken,
    logout,
  };
};

export type AuthService = ReturnType<typeof createAuthService>;
