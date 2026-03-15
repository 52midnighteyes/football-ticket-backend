import { Router } from "express";
import { blogController } from "./blog.controller.js";
import { upload } from "../../middlewares/multer.middleware.js";
import { verifyToken } from "../../middlewares/tokenVerification.middleware.js";

class BlogRouter {
  private router: Router;
  constructor() {
    this.router = Router();
    this.initializeRouter();
  }

  private initializeRouter() {
    this.router.post(
      "/",
      upload.single("file"),
      verifyToken.accessToken,
      blogController.create,
    );
  }
  public getRouter() {
    return this.router;
  }
}

export const blogRoutes = new BlogRouter().getRouter();
