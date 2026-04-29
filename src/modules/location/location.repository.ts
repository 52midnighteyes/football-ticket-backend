import type { Prisma } from "../../../generated/prisma/client.js";
import { prisma } from "../../libs/prisma/prisma.lib.js";
import type { TPrisma } from "../../libs/prisma/prisma.types.js";

export const findManyCountries = async (
  where: Prisma.CountryWhereInput = {},
  db: TPrisma = prisma,
) => {
  return db.country.findMany({
    where,
    include: {
      provinces: {
        include: {
          cities: {
            orderBy: [{ name: "asc" }],
          },
        },
        orderBy: [{ name: "asc" }],
      },
    },
    orderBy: [{ name: "asc" }],
  });
};

export const findManyProvinces = async (
  where: Prisma.ProvinceWhereInput = {},
  db: TPrisma = prisma,
) => {
  return db.province.findMany({
    where,
    include: {
      cities: {
        orderBy: [{ name: "asc" }],
      },
    },
    orderBy: [{ name: "asc" }],
  });
};

export const findManyCities = async (
  where: Prisma.CityWhereInput = {},
  db: TPrisma = prisma,
) => {
  return db.city.findMany({
    where,
    orderBy: [{ name: "asc" }],
  });
};
