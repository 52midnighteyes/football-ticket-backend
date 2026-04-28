import * as zod from "zod";

export const getCategoriesQuerySchema = zod.object({
  id: zod.uuid("Category ID must be a valid UUID").optional(),
  name: zod.string().trim().optional(),
});

export type TGetCategoriesQuery = zod.infer<typeof getCategoriesQuerySchema>;
