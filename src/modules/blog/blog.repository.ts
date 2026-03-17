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
    return await this.prisma.blog.findUnique({
      where: {
        title,
      },
    });
  };

  public findBlogById = async (id: string) => {
    return await this.prisma.blog.findUnique({
      where: {
        id,
      },
      include: {
        author: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  };

  public create = async (params: ICreateBlogDbParams) => {
    return await this.prisma.blog.create({
      data: {
        ...params,
      },
    });
  };

  public update = async (params: ICreateBlogDbParams, id: string) => {
    return await this.prisma.blog.update({
      where: {
        id,
      },
      data: params,
    });
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

  public deleteById = async (id: string, title: string) => {
    return await this.prisma.blog.update({
      where: { id },
      data: {
        title,
        isPublished: false,
        deletedAt: new Date(),
      },
      select: {
        id: true,
        title: true,
        author: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  };

  public togglePublish = async (id: string, isPublished: boolean) => {
    return await this.prisma.blog.update({
      where: { id },
      data: {
        isPublished,
      },
      select: {
        id: true,
        title: true,
        author: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  };
}

export const blogRepo = new BlogRepo();
