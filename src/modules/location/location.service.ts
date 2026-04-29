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

const buildStringFilter = (exact?: string, like?: string) => {
  if (!exact && !like) return undefined;

  return {
    ...(exact
      ? {
          equals: exact,
        }
      : {}),
    ...(like
      ? {
          contains: like,
        }
      : {}),
    mode: "insensitive" as const,
  };
};

export const getCountriesService = async (query: TGetCountriesQuery) => {
  const nameLike = query.nameLike ?? query.name;
  const codeFilter = buildStringFilter(query.code, query.codeLike);
  const nameFilter = buildStringFilter(undefined, nameLike);
  const sortBy = query.sortBy ?? "name";
  const sortOrder = query.sortOrder ?? "asc";

  const where: Prisma.CountryWhereInput = {
    ...(query.id ? { id: query.id } : {}),
    ...(codeFilter ? { code: codeFilter } : {}),
    ...(nameFilter ? { name: nameFilter } : {}),
  };

  return findManyCountries(where, { [sortBy]: sortOrder });
};

export const getProvincesService = async (query: TGetProvincesQuery) => {
  const nameLike = query.nameLike ?? query.name;
  const codeFilter = buildStringFilter(query.code, query.codeLike);
  const nameFilter = buildStringFilter(undefined, nameLike);
  const sortBy = query.sortBy ?? "name";
  const sortOrder = query.sortOrder ?? "asc";

  const where: Prisma.ProvinceWhereInput = {
    ...(query.id ? { id: query.id } : {}),
    ...(query.countryId ? { countryId: query.countryId } : {}),
    ...(codeFilter ? { code: codeFilter } : {}),
    ...(nameFilter ? { name: nameFilter } : {}),
  };

  return findManyProvinces(where, { [sortBy]: sortOrder });
};

export const getCitiesService = async (query: TGetCitiesQuery) => {
  const nameLike = query.nameLike ?? query.name;
  const codeFilter = buildStringFilter(query.code, query.codeLike);
  const nameFilter = buildStringFilter(undefined, nameLike);
  const sortBy = query.sortBy ?? "name";
  const sortOrder = query.sortOrder ?? "asc";

  const where: Prisma.CityWhereInput = {
    ...(query.id ? { id: query.id } : {}),
    ...(query.provinceId ? { provinceId: query.provinceId } : {}),
    ...(codeFilter ? { code: codeFilter } : {}),
    ...(nameFilter ? { name: nameFilter } : {}),
  };

  return findManyCities(where, { [sortBy]: sortOrder });
};
