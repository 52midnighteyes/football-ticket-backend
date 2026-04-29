import type { Prisma } from "../../../generated/prisma/client.js";
import {
  findManyCities,
  findManyCountries,
  findManyProvinces,
} from "./location.repository.js";
import type {
  TGetCitiesQuery,
  TGetCountriesQuery,
  TGetProvincesQuery,
} from "./location.schemas.js";

export const getCountriesService = async (query: TGetCountriesQuery) => {
  const where: Prisma.CountryWhereInput = {
    ...(query.id ? { id: query.id } : {}),
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

  return findManyCountries(where);
};

export const getProvincesService = async (query: TGetProvincesQuery) => {
  const where: Prisma.ProvinceWhereInput = {
    ...(query.id ? { id: query.id } : {}),
    ...(query.countryId ? { countryId: query.countryId } : {}),
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

  return findManyProvinces(where);
};

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
