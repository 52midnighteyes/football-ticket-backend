import type { Prisma } from "../../../generated/prisma/client.js";
import { prisma } from "../../libs/prisma/prisma.lib.js";
import type { TPrisma } from "../../libs/prisma/prisma.types.js";

export const findManyCountries = async (
  where: Prisma.CountryWhereInput = {},
  orderBy: Prisma.CountryOrderByWithRelationInput = { name: "asc" },
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
    orderBy,
  });
};

export const findManyProvinces = async (
  where: Prisma.ProvinceWhereInput = {},
  orderBy: Prisma.ProvinceOrderByWithRelationInput = { name: "asc" },
  db: TPrisma = prisma,
) => {
  return db.province.findMany({
    where,
    include: {
      cities: {
        orderBy: [{ name: "asc" }],
      },
    },
    orderBy,
  });
};

export const findManyCities = async (
  where: Prisma.CityWhereInput = {},
  orderBy: Prisma.CityOrderByWithRelationInput = { name: "asc" },
  db: TPrisma = prisma,
) => {
  return db.city.findMany({
    where,
    orderBy,
  });
};
