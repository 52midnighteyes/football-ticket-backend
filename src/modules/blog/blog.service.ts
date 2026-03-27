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
    let imagePublicId;
    let isUploaded = false;
    try {
      console.log(params, "<<<<<<<<<params");
      const isExists = await blogRepo.findBlogByTitle(params.title);
      if (isExists) throw new AppError(409, "Blog title already exists");

      const { secure_url, public_id } = await cloudinaryConfig.upload(
        params.file,
        params.authorId,
      );
      imagePublicId = public_id;
      isUploaded = true;

      const { file, ...rest } = params;
      const blog = {
        ...rest,
        excerpt: StringConverter.createExcerpt(params.content),
        slug: StringConverter.createSlug(params.title),
        image: secure_url,
        imagePublicId,
      };

      const data = await blogRepo.create(blog);

      return data;
    } catch (error) {
      if (isUploaded) await cloudinaryConfig.delete(imagePublicId!);
      console.error("message:", error);
      throw error;
    }
  };

  public update = async (params: IUpdateBlogParams) => {
    let imagePublicId;
    let isUploaded = false;

    try {
      const blog = await blogRepo.findBlogById(params.id);
      if (!blog) throw new AppError(404, "Blog not found");

      const { public_id, secure_url } = await cloudinaryConfig.upload(
        params.file,
        params.authorId,
      );

      imagePublicId = public_id;
      isUploaded = true;

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
        imagePublicId,
      };

      const data = await blogRepo.update(updatedData, params.id);
      await cloudinaryConfig.delete(blog.imagePublicId);

      return data;
    } catch (error) {
      if (isUploaded) await cloudinaryConfig.delete(imagePublicId!);
      console.error("message:", error);
      throw error;
    }
  };

  public getBlogBySlug = async (slug: string) => {
    try {
      const data = await blogRepo.findBlogBySlug(slug);
      if (!data) throw new AppError(404, "Blog not found");

      if (!data.isPublished || data.deletedAt !== null)
        throw new AppError(403, "Blog is not published or has been deleted");

      const safeData = {
        author: data.author.firstName + " " + data.author.lastName,
        id: data.id,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        image: data.image,
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt,
        content: data.content,
        category: data.category,
      };

      return safeData;
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
      await cloudinaryConfig.delete(blog.imagePublicId);
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
        ...(category && { category }),
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
        }),
      };

      const orderBy: Prisma.BlogOrderByWithRelationInput = {
        [sortBy]: sortOrder,
      };

      const filter = {
        where,
        skip,
        take: limit,
        orderBy,
      };

      console.log(filter);

      const [data, count] = await Promise.all([
        blogRepo.getAll(filter),
        blogRepo.countBlog(where),
      ]);

      const totalPages = Math.ceil(count / limit);

      const meta = {
        totalItems: count,
        totalPages,
        currentPage: page,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      };

      return { data, meta };
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
