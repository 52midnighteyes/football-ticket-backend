import type {
  ICreateBlogDbParams,
  ICreateBlogParams,
  IGetAllBlogsQuery,
  ITogglePublishParams,
  IUpdateBlogParams,
} from "./blog.interface.js";
import { blogRepo } from "./blog.repository.js";
import { AppError } from "../../class/appError.js";
import { StringConverter } from "../../helper/stringConverter.js";
import { cloudinaryConfig } from "../../libs/cloudinary/cloudinary.lib.js";
import { Prisma } from "../../../generated/prisma/client.js";
class BlogService {
  public create = async (params: ICreateBlogParams) => {
    let publicId;
    try {
      const isExists = await blogRepo.findBlogByTitle(params.title);
      if (isExists) throw new AppError(409, "Blog title already exists");

      const { secure_url, public_id } = await cloudinaryConfig.upload(
        params.file,
        params.authorId,
      );
      publicId = public_id;

      const { file, ...rest } = params;
      const blog = {
        ...rest,
        excerpt: StringConverter.createExcerpt(params.content),
        slug: StringConverter.createSlug(params.title),
        image: secure_url,
      };

      const data = await blogRepo.create(blog);

      return data;
    } catch (error) {
      await cloudinaryConfig.delete(publicId!);
      console.error("message:", error);
      throw error;
    }
  };

  public update = async (params: IUpdateBlogParams) => {
    let publicId;

    try {
      const blog = await blogRepo.findBlogById(params.id);
      if (!blog) throw new AppError(404, "Blog not found");

      const { public_id, secure_url } = await cloudinaryConfig.upload(
        params.file,
        params.authorId,
      );

      publicId = public_id;

      const { file, ...rest } = params;

      const updatedData: ICreateBlogDbParams = {
        ...rest,
        slug:
          params.title === blog.title
            ? blog.slug
            : StringConverter.createSlug(params.title),
        excerpt:
          params.content !== blog.content
            ? blog.excerpt
            : StringConverter.createExcerpt(params.content),
        image: secure_url!,
      };

      const data = await blogRepo.update(updatedData, params.id);

      return data;
    } catch (error) {
      await cloudinaryConfig.delete(publicId!);
      console.error("message:", error);
      throw error;
    }
  };

  public getById = async (id: string) => {
    try {
      const data = await blogRepo.findBlogById(id);
      if (!data) throw new AppError(404, "Blog not found");

      if (!data.isPublished || data.deletedAt !== null)
        throw new AppError(403, "Blog is not published or has been deleted");

      return data;
    } catch (error) {
      console.error("message:", error);
      throw error;
    }
  };

  public deleteById = async (id: string) => {
    try {
      const blog = await blogRepo.findBlogById(id);
      if (!blog) throw new AppError(404, "blog not found");

      const newTitle = "[DELETED]" + blog.title;

      const data = await blogRepo.deleteById(blog.id, newTitle);

      return data;
    } catch (error) {
      console.error("message:", error);
      throw error;
    }
  };

  public getAll = async (params: IGetAllBlogsQuery) => {
    try {
      const { search, category, page, limit, sortBy, sortOrder } = params;
      const skip = (page - 1) * limit;
      const where = {
        isPublished: true,
        deletedAt: null,
        ...(search && {
          OR: [
            {
              title: {
                contains: search,
                mode: "insensitive" as const,
              },
            },
            {
              content: {
                contains: search,
                mode: "insensitive" as const,
              },
            },
          ],

          ...(category && { category }),
        }),
      };

      const orderBy: Prisma.BlogOrderByWithRelationInput = {
        [sortBy]: sortOrder,
      };

      const filter = {
        where,
        skip,
        orderBy,
      };

      const [data, count] = await Promise.all([
        blogRepo.getAll(filter),
        blogRepo.countBlog(where),
      ]);

      return { data, count };
    } catch (error) {
      console.error("message:", error);
      throw error;
    }
  };

  public togglePublish = async (params: ITogglePublishParams) => {
    try {
      const blog = await blogRepo.findBlogById(params.id);
      if (!blog) throw new AppError(404, "Blog not found");

      const data = await blogRepo.togglePublish(blog.id, !blog.isPublished);

      return data;
    } catch (error) {
      console.error("message:", error);
      throw error;
    }
  };
}

export const blogService = new BlogService();
