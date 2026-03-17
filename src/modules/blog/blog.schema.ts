import * as z from "zod";
import { blogCategories } from "../../enum/blogCategory.enum.js";
export const createBlogSchema = z.object({
  title: z.string().nonempty("Title is required").trim(),
  content: z.string().nonempty("Content is required").trim(),
  isPublished: z.boolean().optional(),
  category: z.enum(blogCategories, {
    message:
      "Catagory has to be one of the following: " + blogCategories.join(", "),
  }),
});

export const updateBlogSchema = z.object({
  id: z.uuid().nonempty("Blog ID is required"),
  title: z.string().nonempty("Title is required").trim(),
  content: z.string().nonempty("Content is required").trim(),
  isPublished: z.boolean().optional(),
  category: z.enum(blogCategories, {
    message:
      "Catagory has to be one of the following: " + blogCategories.join(", "),
  }),
});

export const getBlogByIdSchema = z.object({
  id: z.uuid().nonempty("Blog ID is required"),
});

export const deleteBlogByIdSchema = z.object({
  id: z.uuid(),
});

export const getAllBlogsSchema = z.object({
  search: z.string().trim().optional(),

  category: z
    .enum(blogCategories, {
      message:
        "Category has to be one of the following: " + blogCategories.join(", "),
    })
    .optional(),

  page: z.coerce.number().int().min(1, "Page must be at least 1").default(1),

  limit: z.coerce
    .number()
    .int()
    .min(1, "Limit must be at least 1")
    .max(100, "Limit cannot be more than 100")
    .default(10),

  sortBy: z
    .enum(["createdAt", "title"], {
      message: "Sort By has to be one of the following: createdAt, title",
    })
    .default("createdAt"),

  sortOrder: z
    .enum(["asc", "desc"], {
      message: "Sort Order has to be one of the following: asc, desc",
    })
    .default("desc"),
});

export const togglePublishBodySchema = z.object({
  id: z.uuid().nonempty("Blog ID is required"),
});

export const togglepublishparamSchema = z.object({
  isPublished: z.boolean(),
});
