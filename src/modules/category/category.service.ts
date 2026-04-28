import type { Prisma } from "../../../generated/prisma/client.js";
import { findManyCategories } from "./category.repository.js";
import type { TGetCategoriesQuery } from "./category.schemas.js";

export const getCategoriesService = async (query: TGetCategoriesQuery) => {
  const where: Prisma.CategoryWhereInput = {
    ...(query.id ? { id: query.id } : {}),
    ...(query.name
      ? {
          name: {
            contains: query.name,
            mode: "insensitive",
          },
        }
      : {}),
  };

  return findManyCategories(where);
};
