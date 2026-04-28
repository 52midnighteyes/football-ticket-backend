import type { Prisma } from "../../../generated/prisma/client.js";
import { prisma } from "../../libs/prisma/prisma.lib.js";
import type { TPrisma } from "../../libs/prisma/prisma.types.js";

export const findManyCategories = async (
  where: Prisma.CategoryWhereInput = {},
  db: TPrisma = prisma,
) => {
  return db.category.findMany({
    where: {
      deletedAt: null,
      ...where,
    },
    orderBy: [{ name: "asc" }],
  });
};
