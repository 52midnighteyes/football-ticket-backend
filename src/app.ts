import express, {
  type Application,
  type Request,
  type Response,
} from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import { errorHandler } from "./middlewares/errorHandler.middleware.js";
import { FRONTEND_URL, PORT } from "./config/config.js";
import helmet from "helmet";
import { AppError } from "./class/appError.js";
import type { AppModule } from "./types/module.type.js";

export default class App {
  private app: Application;

  constructor(private modules: AppModule[]) {
    this.app = express();
    this.initializeMiddleware();
    this.initializeRoute();
    this.initializeNotFoundHandler();
    this.initializeErrorHandler();
  }

  private initializeMiddleware = () => {
    this.app.disable("x-powered-by");
    this.app.use(cookieParser());
    this.app.use(
      cors({
        origin: FRONTEND_URL,
        credentials: true,
      }),
    );
    this.app.use(helmet());
    this.app.use(express.json());
  };

  private initializeRoute = () => {
    this.app.get("/", (_req: Request, res: Response) => {
      res.send(`Your API is running on port: ${PORT}`);
    });

    for (const { path, router } of this.modules) {
      this.app.use(path, router);
    }
  };

  private initializeNotFoundHandler = () => {
    this.app.use((_req, _res, next) => {
      next(new AppError(404, "Route not found"));
    });
  };

  private initializeErrorHandler = () => {
    this.app.use(errorHandler.handle);
  };

  public start = () => {
    this.app.listen(PORT, () => {
      console.log(`server is running on port ${PORT}`);
    });
  };
}
