import type { Prisma } from "../../../generated/prisma/client.js";
import { findManyCategories } from "./category.repository.js";
import type { TGetCategoriesQuery } from "./category.schemas.js";

export const getCategoriesService = async (query: TGetCategoriesQuery) => {
  const nameLike = query.nameLike ?? query.name;
  const sortBy = query.sortBy ?? "name";
  const sortOrder = query.sortOrder ?? "asc";

  const where: Prisma.CategoryWhereInput = {
    ...(query.id ? { id: query.id } : {}),
    ...(nameLike
      ? {
          name: {
            contains: nameLike,
            mode: "insensitive",
          },
        }
      : {}),
  };

  return findManyCategories(where, { [sortBy]: sortOrder });
};
