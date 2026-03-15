import { prisma as db } from "../../libs/prisma/prisma.lib.js";
import type { TPrisma } from "../../libs/prisma/prisma.types.js";

class UserRepository {
  prisma: TPrisma;

  constructor() {
    this.prisma = db;
  }

  public findUserByEmail = async (email: string) => {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          email,
        },
      });

      return user;
    } catch (error) {
      console.error("message: ", error);
      throw error;
    }
  };
}

export const userRepo = new UserRepository();
