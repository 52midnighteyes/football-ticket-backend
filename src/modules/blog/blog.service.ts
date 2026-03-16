import type {
  ICreateBlogDbParams,
  ICreateBlogParams,
  IUpdateBlogParams,
} from "./blog.interface.js";
import { blogRepo } from "./blog.repository.js";
import { AppError } from "../../class/appError.js";
import { StringConverter } from "../../helper/stringConverter.js";
import { cloudinaryConfig } from "../../libs/cloudinary/cloudinary.lib.js";

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
}

export const blogService = new BlogService();
