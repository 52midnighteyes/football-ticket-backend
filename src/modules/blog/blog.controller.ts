import { type Response, type Request, type NextFunction } from "express";
import { blogService } from "./blog.service.js";
import { AppError } from "../../class/appError.js";
import type {
  ICreateBlogParams,
  IGetAllBlogsQuery,
  ITogglePublishParams,
  IUpdateBlogParams,
} from "./blog.interface.js";

class BlogController {
  public create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { file } = req;
      if (!file) throw new AppError(400, "Image file is required");
      const payload = req.validated!.body as Omit<
        ICreateBlogParams,
        "file" | "authorId"
      >;
      const id = req.user?.id;
      const data = await blogService.create({
        ...payload,
        file,
        authorId: id!,
      } as ICreateBlogParams);

      res.status(201).json({ message: "Blog created successfully", data });
    } catch (error) {
      next(error);
    }
  };

  public update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { file } = req;
      if (!file) throw new AppError(400, "Image file is required");
      const payload = req.validated!.body as Omit<
        IUpdateBlogParams,
        "file" | "authorId"
      >;
      const id = req.user?.id;
      const data = await blogService.update({
        ...payload,
        file,
        authorId: id!,
      });

      res.status(201).json({ message: "Blog updated successfully", data });
    } catch (error) {
      next(error);
    }
  };

  public getById = async (req: Request, res: Response, Next: NextFunction) => {
    try {
      const { id } = req.validated!.params as { id: string };
      const data = await blogService.getById(id);

      res.status(200).json({ message: "Blog fetched successfully", data });
    } catch (error) {
      Next(error);
    }
  };

  public getAll = async (req: Request, res: Response, Next: NextFunction) => {
    try {
      const payload = req.validated!.query as IGetAllBlogsQuery;
      const data = await blogService.getAll(payload);

      res.status(200).json({ message: "Blogs fetched successfully", data });
    } catch (error) {
      Next(error);
    }
  };

  public deleteById = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { id } = req.validated?.params as { id: string };
      const data = await blogService.deleteById(id);

      res.status(200).json({ message: "Blog deleted successfully", data });
    } catch (error) {
      next(error);
    }
  };

  public togglePublish = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { id } = req.validated?.params as { id: string };
      const payload = req.validated?.body as Omit<ITogglePublishParams, "id">;

      const data = await blogService.togglePublish({ ...payload, id });
      res.status(200).json({ message: "Blog publish status updated", data });
    } catch (error) {
      next(error);
    }
  };
}

export const blogController = new BlogController();
