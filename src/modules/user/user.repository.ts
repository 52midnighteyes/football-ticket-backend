import type { UserCreateInput } from "../../../generated/prisma/models.js";
import { prisma } from "../../libs/prisma/prisma.lib.js";
import type { TPrisma } from "../../libs/prisma/prisma.types.js";

export const findUserByEmail = async (email: string, db: TPrisma = prisma) => {
  return db.user.findUnique({
    where: {
      email,
    },
  });
};

export const findUserById = async (id: string, db: TPrisma = prisma) => {
  return db.user.findUnique({
    where: { id },
  });
};

export const createUser = async (
  data: UserCreateInput,
  db: TPrisma = prisma
) => {
  return db.user.create({
    data,
  });
};
