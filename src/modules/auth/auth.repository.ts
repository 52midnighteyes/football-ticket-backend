import {
  RefreshTokenCreateInput,
  RefreshTokenCreateWithoutUserInput,
  RefreshTokenUncheckedCreateInput,
} from "../../../generated/prisma/models.js";
import { prisma } from "../../libs/prisma/prisma.lib.js";
import type { TPrisma } from "../../libs/prisma/prisma.types.js";

export const findRefreshTokenByHashedToken = async (
  hashedToken: string,
  db: TPrisma = prisma
) => {
  return db.refreshToken.findFirst({
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

export const deleteRefreshTokenByHashedToken = async (
  hashedToken: string,
  db: TPrisma = prisma
) => {
  return db.refreshToken.delete({
    where: {
      hashedToken,
    },
  });
};

export const createRefreshToken = async (
  data: RefreshTokenUncheckedCreateInput,
  db: TPrisma = prisma
) => {
  return await db.refreshToken.create({
    data,
  });
};
