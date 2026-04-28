import * as zod from "zod";

export const getCitiesQuerySchema = zod.object({
  id: zod.uuid("City ID must be a valid UUID").optional(),
  provinceId: zod.uuid("Province ID must be a valid UUID").optional(),
  code: zod.string().trim().optional(),
  name: zod.string().trim().optional(),
});

export type TGetCitiesQuery = zod.infer<typeof getCitiesQuerySchema>;
