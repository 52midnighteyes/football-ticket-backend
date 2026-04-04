import { prisma } from "../../libs/prisma/prisma.lib.js";
import type { TPrisma } from "../../libs/prisma/prisma.types.js";

type CreateRefreshTokenParams = {
  hashedToken: string;
  userId: string;
  expiresAt: Date;
};

export const createAuthRepository = (db: TPrisma = prisma) => {
  const createRefreshToken = async (
    params: CreateRefreshTokenParams,
    tx: TPrisma = db,
  ) => {
    return tx.refreshToken.create({
      data: params,
    });
  };

  const findRefreshTokenByHashedToken = async (
    hashedToken: string,
    tx: TPrisma = db,
  ) => {
    return tx.refreshToken.findFirst({
      where: {
        hashedToken,
        expiresAt: {
          gte: new Date(),
        },
      },
      include: {
        user: true,
      },
    });
  };

  const deleteRefreshTokenByHashedToken = async (
    hashedToken: string,
    tx: TPrisma = db,
  ) => {
    return tx.refreshToken.delete({
      where: {
        hashedToken,
      },
    });
  };

  return {
    createRefreshToken,
    findRefreshTokenByHashedToken,
    deleteRefreshTokenByHashedToken,
  };
};

export type AuthRepository = ReturnType<typeof createAuthRepository>;
