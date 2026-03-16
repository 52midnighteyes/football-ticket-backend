import { Router } from "express";
import { blogController } from "./blog.controller.js";
import { upload } from "../../middlewares/multer.middleware.js";
import { verifyToken } from "../../middlewares/tokenVerification.middleware.js";
import { inputValidator } from "../../middlewares/zodValidator.middleware.js";
import { createBlogSchema, updateBlogSchema } from "./blog.schema.js";

class BlogRouter {
  private router: Router;
  constructor() {
    this.router = Router();
    this.initializeRouter();
  }

  private initializeRouter() {
    this.router.use(verifyToken.accessToken);
    this.router.post(
      "/",
      upload.single("file"),
      inputValidator.schema(createBlogSchema, "body"),
      blogController.create,
    );
    this.router.put(
      "/",
      upload.single("file"),
      inputValidator.schema(updateBlogSchema, "body"),
      blogController.update,
    );
  }

  public getRouter() {
    return this.router;
  }
}

export const blogRoutes = new BlogRouter().getRouter();
