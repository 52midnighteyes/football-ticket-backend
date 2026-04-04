import express, {
  type Application,
  type Request,
  type Response,
} from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import { handleError } from "./middlewares/errorHandler.middleware.js";
import { FRONTEND_URL, PORT } from "./config/config.js";
import helmet from "helmet";
import { createAppError } from "./class/appError.js";
import type { AppModule } from "./types/module.type.js";

const initializeMiddleware = (app: Application) => {
  app.disable("x-powered-by");
  app.use(cookieParser());
  app.use(
    cors({
      origin: FRONTEND_URL,
      credentials: true,
    }),
  );
  app.use(helmet());
  app.use(express.json());
};

const initializeRoute = (app: Application, modules: AppModule[]) => {
  app.get("/", (_req: Request, res: Response) => {
    res.send(`Your API is running on port: ${PORT}`);
  });

  for (const { path, router } of modules) {
    app.use(path, router);
  }
};

const initializeNotFoundHandler = (app: Application) => {
  app.use((_req, _res, next) => {
    next(createAppError(404, "Route not found"));
  });
};

const initializeErrorHandler = (app: Application) => {
  app.use(handleError);
};

export const createApp = (modules: AppModule[]) => {
  const app = express();

  initializeMiddleware(app);
  initializeRoute(app, modules);
  initializeNotFoundHandler(app);
  initializeErrorHandler(app);

  return app;
};

export const startApp = (app: Application) => {
  return app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`);
  });
};
