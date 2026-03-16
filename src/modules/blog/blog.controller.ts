import { type Response, type Request, type NextFunction } from "express";
import { blogService } from "./blog.service.js";
import { AppError } from "../../class/appError.js";

class BlogController {
  public create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { file } = req;
      if (!file) throw new AppError(400, "Image file is required");
      const payload = req.body;
      const id = req.user?.id;
      const data = await blogService.create({
        ...payload,
        file,
        authorId: id!,
      });

      res.status(201).json({ message: "Blog created successfully", data });
    } catch (error) {
      next(error);
    }
  };

  public update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { file } = req;
      if (!file) throw new AppError(400, "Image file is required");
      const payload = req.body;
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
}

export const blogController = new BlogController();
