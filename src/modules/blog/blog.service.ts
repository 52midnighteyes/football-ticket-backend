import type { ICreateBlogParams } from "./blog.interface.js";
import { blogRepo } from "./blog.repository.js";
import { AppError } from "../../class/appError.js";
import { StringConverter } from "../../helper/stringConverter.js";
import { cloudinaryConfig } from "../../libs/cloudinary/cloudinary.lib.js";

class BlogService {
  public create = async (params: ICreateBlogParams) => {
    try {
      const isExists = await blogRepo.findBlogByTitle(params.title);
      if (isExists) throw new AppError(409, "Blog title already exists");

      const { secure_url } = await cloudinaryConfig.cloudinaryUpload(
        params.file,
        params.authorId,
      );

      const { file, ...rest } = params;
      const blog = {
        ...rest,
        excerpt: StringConverter.createExcerpt(params.content),
        slug: StringConverter.createSlug(params.title),
        image: secure_url,
      };

      const data = await blogRepo.createBlog(blog);
      return data;
    } catch (error) {
      console.error("message:", error);
      throw error;
    }
  };
}

export const blogService = new BlogService();
