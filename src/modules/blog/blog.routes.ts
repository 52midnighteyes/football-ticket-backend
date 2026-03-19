import { Router } from "express";
import { blogController } from "./blog.controller.js";
import { upload } from "../../middlewares/multer.middleware.js";
import { verifyToken } from "../../middlewares/tokenVerification/tokenVerification.middleware.js";
import { inputValidator } from "../../middlewares/zodValidator.middleware.js";
import {
  createBlogSchema,
  deleteBlogByIdSchema,
  getAllBlogsSchema,
  getBlogByIdSchema,
  togglePublishBodySchema,
  togglepublishparamSchema,
  updateBlogSchema,
} from "./blog.schema.js";
import {
  blogDetailLimiter,
  blogReadLimiter,
  blogUploadLimiter,
  blogWriteLimiter,
} from "./blog.ratelimiter.js";

class BlogRouter {
  private router: Router;
  constructor() {
    this.router = Router();
    this.initializeRouter();
  }

  private initializeRouter() {
    this.router.get(
      "/:id",
      blogDetailLimiter,
      inputValidator.schema(getBlogByIdSchema, "params"),
      blogController.getById,
    );

    this.router.get(
      "/",
      blogReadLimiter,
      inputValidator.schema(getAllBlogsSchema, "query"),
      blogController.getAll,
    );

    this.router.use(verifyToken.accessToken);

    this.router.patch(
      "/:id/archive",
      blogWriteLimiter,
      inputValidator.schema(deleteBlogByIdSchema, "params"),
      blogController.deleteById,
    );

    this.router.patch(
      "/toggle-publish/:id",
      blogWriteLimiter,
      inputValidator.schema(togglePublishBodySchema, "body"),
      inputValidator.schema(togglepublishparamSchema, "params"),
      blogController.togglePublish,
    );

    this.router.post(
      "/",
      blogUploadLimiter,
      upload.single("file"),
      inputValidator.schema(createBlogSchema, "body"),
      blogController.create,
    );

    this.router.put(
      "/:id",
      blogUploadLimiter,
      upload.single("file"),
      inputValidator.schema(updateBlogSchema, "body"),
      inputValidator.schema(getBlogByIdSchema, "params"),
      blogController.update,
    );
  }

  public getRouter() {
    return this.router;
  }
}

export const blogRoutes = new BlogRouter().getRouter();
