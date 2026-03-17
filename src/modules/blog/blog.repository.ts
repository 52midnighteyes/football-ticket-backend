import type { Prisma } from "../../../generated/prisma/client.js";
import { prisma as db } from "../../libs/prisma/prisma.lib.js";
import type { TPrisma } from "../../libs/prisma/prisma.types.js";
import type {
  ICreateBlogDbParams,
  IGetAllBlogsQueryDbParams,
} from "./blog.interface.js";

class BlogRepo {
  prisma: TPrisma;
  constructor() {
    this.prisma = db;
  }

  public findBlogByTitle = async (title: string) => {
    try {
      return await this.prisma.blog.findUnique({
        where: {
          title,
        },
      });
    } catch (error) {
      console.error("message:", error);
      throw error;
    }
  };

  public findBlogById = async (id: string) => {
    try {
      return await this.prisma.blog.findUnique({
        where: {
          id,
        },
      });
    } catch (error) {
      console.error("message:", error);
      throw error;
    }
  };

  public create = async (params: ICreateBlogDbParams) => {
    try {
      return await this.prisma.blog.create({
        data: {
          ...params,
        },
      });
    } catch (error) {
      console.error("message:", error);
      throw error;
    }
  };

  public update = async (params: ICreateBlogDbParams, id: string) => {
    try {
      return await this.prisma.blog.update({
        where: {
          id,
        },
        data: params,
      });
    } catch (error) {
      console.error("message:", error);
      throw error;
    }
  };

  public getAll = async (params: IGetAllBlogsQueryDbParams) => {
    return await this.prisma.blog.findMany({
      ...(params.where && { where: params.where }),
      ...(params.skip !== undefined && { skip: params.skip }),
      ...(params.take !== undefined && { take: params.take }),
      ...(params.orderBy && { orderBy: params.orderBy }),
      select: {
        id: true,
        title: true,
        slug: true,
        category: true,
        isPublished: true,
        createdAt: true,
      },
    });
  };

  public countBlog = async (where?: Prisma.BlogWhereInput) => {
    return this.prisma.blog.count(where ? { where } : undefined);
  };
}

export const blogRepo = new BlogRepo();
