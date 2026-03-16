import type { BlogCategory } from "../../../generated/prisma/enums.js";

//--- service params
export interface ICreateBlogParams {
  file: Express.Multer.File;
  title: string;
  content: string;
  isPublished?: boolean;
  authorId: string;
  category: BlogCategory;
}

export interface IUpdateBlogParams {
  id: string;
  authorId: string;
  file: Express.Multer.File;
  title: string;
  content: string;
  isPublished: boolean;
  category: BlogCategory;
}

//--- DB params

export interface ICreateBlogDbParams extends Omit<ICreateBlogParams, "file"> {
  image: string;
  excerpt: string;
  slug: string;
}
