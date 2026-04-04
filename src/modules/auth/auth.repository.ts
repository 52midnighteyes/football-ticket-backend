import { gte } from "zod";
import { prisma } from "../../libs/prisma/prisma.lib.js";
import type { TPrisma } from "../../libs/prisma/prisma.types.js";

type CreateRefreshTokenParams = {
  hashedToken: string;
  userId: string;
  expiresAt: Date;
};

export class AuthRepository {
  private db: TPrisma;

  constructor() {
    this.db = prisma;
  }

  public createRefreshToken = async (
    params: CreateRefreshTokenParams,
    db: TPrisma = this.db,
  ) => {
    return db.refreshToken.create({
      data: params,
    });
  };

  public findRefreshTokenByHashedToken = async (
    hashedToken: string,
    db: TPrisma = this.db,
  ) => {
    return db.refreshToken.findUnique({
      where: {
        hashedToken,
        expiresAt: {
          gte: new Date(Date.now()),
        },
      },
      include: {
        user: true,
      },
    });
  };

  public deleteRefreshTokenByHashedToken = async (
    hashedToken: string,
    db: TPrisma = this.db,
  ) => {
    return db.refreshToken.delete({
      where: {
        hashedToken,
      },
    });
  };
}
