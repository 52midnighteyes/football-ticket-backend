import express from "express";
import type { Application } from "express";
import type { Response, Request, NextFunction } from "express";
import { errorHandler } from "./middlewares/errorHandler.middleware.js";
import { NODE_ENV, PORT } from "./config/config.js";
import { authRoutes } from "./modules/auth/auth.routes.js";
import { blogRoutes } from "./modules/blog/blog.routes.js";
// import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import { matchRouter } from "./modules/match/match.routes.js";

class App {
  app: Application;
  constructor() {
    this.app = express();

    this.initializeMiddleware();
    this.initializeRoutes();
    this.initializeErrorHandlers();
  }

  private initializeMiddleware(): void {
    // this.app.use(helmet());
    this.app.use(
      cors({
        origin: "http://localhost:5173",
        credentials: true,
      }),
    );
    this.app.use(cookieParser());
    this.app.use(express.json());

    // Request logger middleware (only in development)
    this.app.use((req: Request, _res: Response, next: NextFunction) => {
      const isProd = NODE_ENV === "production";
      if (isProd) return next();

      console.log("===== Incoming Request =====");
      console.log("Time     :", new Date().toISOString());
      console.log("Method   :", req.method);
      console.log("URL      :", req.originalUrl);
      console.log("Headers  :", req.headers);
      console.log("Body     :", req.body);
      console.log("Query    :", req.query);
      console.log("File     :", req.file);
      console.log("refreshToken :", req.cookies.refreshToken);
      console.log("============================\n");

      next();
    });
  }

  private initializeRoutes(): void {
    this.app.get("/", (_req: Request, res: Response) => {
      res.send(`Your API is running on port: ${PORT}`);
    });

    this.app.use("/api/auth", authRoutes);
    this.app.use("/api/blogs", blogRoutes);
    this.app.use("/api/matches", matchRouter);
  }

  private initializeErrorHandlers(): void {
    this.app.use(errorHandler.handle);
  }

  public start = (): void => {
    this.app.listen(PORT, () => {
      console.log(`server is running on port ${PORT}`);
    });
  };
}

export const app = new App();
