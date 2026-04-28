import type { Prisma } from "../../../generated/prisma/client.js";
import { prisma } from "../../libs/prisma/prisma.lib.js";
import type { TPrisma } from "../../libs/prisma/prisma.types.js";

export const findManyCities = async (
  where: Prisma.CityWhereInput = {},
  db: TPrisma = prisma,
) => {
  return db.city.findMany({
    where,
    orderBy: [{ name: "asc" }],
  });
};
