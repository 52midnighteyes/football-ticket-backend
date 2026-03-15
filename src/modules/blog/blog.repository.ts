import { prisma as db } from "../../libs/prisma/prisma.lib.js";
import type { TPrisma } from "../../libs/prisma/prisma.types.js";
import type { ICreateBlogDbParams } from "./blog.interface.js";

class BlogRepo {
  prisma: TPrisma;
  constructor() {
    this.prisma = db;
  }

  public findBlogByTitle = async (title: string) => {
    try {
      const blog = await this.prisma.blog.findUnique({
        where: {
          title,
        },
      });

      return blog;
    } catch (error) {
      console.error("message:", error);
      throw error;
    }
  };

  public createBlog = async (params: ICreateBlogDbParams) => {
    try {
      const blog = await this.prisma.blog.create({
        data: {
          ...params,
        },
      });

      return blog;
    } catch (error) {
      console.error("message:", error);
      throw error;
    }
  };
}

export const blogRepo = new BlogRepo();
