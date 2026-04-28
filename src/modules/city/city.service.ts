import type { Prisma } from "../../../generated/prisma/client.js";
import { findManyCities } from "./city.repository.js";
import type { TGetCitiesQuery } from "./city.schemas.js";

export const getCitiesService = async (query: TGetCitiesQuery) => {
  const where: Prisma.CityWhereInput = {
    ...(query.id ? { id: query.id } : {}),
    ...(query.provinceId ? { provinceId: query.provinceId } : {}),
    ...(query.code
      ? {
          code: {
            equals: query.code,
            mode: "insensitive",
          },
        }
      : {}),
    ...(query.name
      ? {
          name: {
            contains: query.name,
            mode: "insensitive",
          },
        }
      : {}),
  };

  return findManyCities(where);
};
