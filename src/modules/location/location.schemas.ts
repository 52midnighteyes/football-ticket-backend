import * as zod from "zod";

export const getCountriesQuerySchema = zod.object({
  id: zod.uuid("Country ID must be a valid UUID").optional(),
  code: zod.string().trim().optional(),
  name: zod.string().trim().optional(),
});

export const getProvincesQuerySchema = zod.object({
  id: zod.uuid("Province ID must be a valid UUID").optional(),
  countryId: zod.uuid("Country ID must be a valid UUID").optional(),
  code: zod.string().trim().optional(),
  name: zod.string().trim().optional(),
});

export const getCitiesQuerySchema = zod.object({
  id: zod.uuid("City ID must be a valid UUID").optional(),
  provinceId: zod.uuid("Province ID must be a valid UUID").optional(),
  code: zod.string().trim().optional(),
  name: zod.string().trim().optional(),
});

export type TGetCountriesQuery = zod.infer<typeof getCountriesQuerySchema>;
export type TGetProvincesQuery = zod.infer<typeof getProvincesQuerySchema>;
export type TGetCitiesQuery = zod.infer<typeof getCitiesQuerySchema>;
