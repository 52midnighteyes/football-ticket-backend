import type { UserCreateInput } from "../../../generated/prisma/models.js";
import { prisma } from "../../libs/prisma/prisma.lib.js";
import type { TPrisma } from "../../libs/prisma/prisma.types.js";

export const createUserRepository = (db: TPrisma = prisma) => {
  const findUserByEmail = async (email: string) => {
    return db.user.findUnique({
      where: {
        email,
      },
    });
  };

  const findUserById = async (id: string) => {
    return db.user.findUnique({
      where: { id },
    });
  };

  const createUser = async (data: UserCreateInput) => {
    return db.user.create({
      data,
    });
  };

  return {
    findUserByEmail,
    findUserById,
    createUser,
  };
};

export type UserRepository = ReturnType<typeof createUserRepository>;
