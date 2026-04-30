import * as zod from "zod";

const sortOrderSchema = zod.enum(["asc", "desc"]);
const locationSortBySchema = zod.enum(["name", "code", "createdAt", "updatedAt"]);

export const getCountriesQuerySchema = zod.object({
  id: zod.uuid("Country ID must be a valid UUID").optional(),
  code: zod.string().trim().optional(),
  name: zod.string().trim().optional(),
  codeLike: zod.string().trim().optional(),
  nameLike: zod.string().trim().optional(),
  sortBy: locationSortBySchema.optional(),
  sortOrder: sortOrderSchema.optional(),
});

export const getProvincesQuerySchema = zod.object({
  id: zod.uuid("Province ID must be a valid UUID").optional(),
  countryId: zod.uuid("Country ID must be a valid UUID").optional(),
  code: zod.string().trim().optional(),
  name: zod.string().trim().optional(),
  codeLike: zod.string().trim().optional(),
  nameLike: zod.string().trim().optional(),
  sortBy: locationSortBySchema.optional(),
  sortOrder: sortOrderSchema.optional(),
});

export const getCitiesQuerySchema = zod.object({
  id: zod.uuid("City ID must be a valid UUID").optional(),
  provinceId: zod.uuid("Province ID must be a valid UUID").optional(),
  code: zod.string().trim().optional(),
  name: zod.string().trim().optional(),
  codeLike: zod.string().trim().optional(),
  nameLike: zod.string().trim().optional(),
  sortBy: locationSortBySchema.optional(),
  sortOrder: sortOrderSchema.optional(),
});

export type TGetCountriesQuery = zod.infer<typeof getCountriesQuerySchema>;
export type TGetProvincesQuery = zod.infer<typeof getProvincesQuerySchema>;
export type TGetCitiesQuery = zod.infer<typeof getCitiesQuerySchema>;
