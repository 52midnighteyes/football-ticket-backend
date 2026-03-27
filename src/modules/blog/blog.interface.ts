import type { Prisma } from "../../../generated/prisma/client.js";
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
  imagePublicId: string;
}

export interface IGetAllBlogsQuery {
  search?: string;
  category?: BlogCategory;
  page: number;
  limit: number;
  sortBy: "createdAt" | "title";
  sortOrder: "asc" | "desc";
}

export interface ITogglePublishParams {
  id: string;
  isPublished: Boolean;
}

//--- DB params

export interface ICreateBlogDbParams extends Omit<ICreateBlogParams, "file"> {
  image: string;
  excerpt: string;
  slug: string;
  imagePublicId: string;
}

export interface IGetAllBlogsQueryDbParams {
  where?: Prisma.BlogWhereInput;
  skip?: number;
  take?: number;
  orderBy?: Prisma.BlogOrderByWithRelationInput;
}
