import * as zod from "zod";

const sortOrderSchema = zod.enum(["asc", "desc"]);
const categorySortBySchema = zod.enum(["name", "createdAt", "updatedAt"]);

export const getCategoriesQuerySchema = zod.object({
  id: zod.uuid("Category ID must be a valid UUID").optional(),
  name: zod.string().trim().optional(),
  nameLike: zod.string().trim().optional(),
  sortBy: categorySortBySchema.optional(),
  sortOrder: sortOrderSchema.optional(),
});

export type TGetCategoriesQuery = zod.infer<typeof getCategoriesQuerySchema>;
