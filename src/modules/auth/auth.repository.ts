import { argon2id } from "argon2";
import { prisma as db } from "../../libs/prisma/prisma.lib.js";
import type { TPrisma } from "../../libs/prisma/prisma.types.js";
import type { IRegisterParams } from "./auth.interface.js";

class AuthRepository {
  prisma: TPrisma;
  constructor() {
    this.prisma = db;
  }

  public createUser = async (params: IRegisterParams) => {
    const user = await this.prisma.user.create({
      data: {
        ...params,
      },
      omit: {
        password: true,
        updatedAt: true,
        createdAt: true,
      },
    });

    return user;
  };
}

export const authRepo = new AuthRepository();
