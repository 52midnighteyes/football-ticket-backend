import { UserCreateInput } from "../../../generated/prisma/models.js";
import { prisma } from "../../libs/prisma/prisma.lib.js";
import type { TPrisma } from "../../libs/prisma/prisma.types.js";
import type { TRegisterParams } from "../auth/auth.schemas.js";

export default class UserRepository {
  private db: TPrisma;

  constructor() {
    this.db = prisma;
  }

  public findUserByEmail = async (email: string) => {
    return this.db.user.findUnique({
      where: {
        email,
      },
    });
  };

  public findUserById = async (id: string) => {
    return this.db.user.findUnique({
      where: { id },
    });
  };

  public createUser = async (data: UserCreateInput) => {
    return this.db.user.create({
      data,
    });
  };
}
