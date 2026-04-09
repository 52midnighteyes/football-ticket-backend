import express, { NextFunction, type Request, type Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import { FRONTEND_URL, PORT } from "./config/config.js";
import helmet from "helmet";
import { AppError } from "./class/appError.js";
import { errorHandler } from "./middlewares/errorHandler.middleware.js";

import AuthRouter from "./modules/auth/auth.route.js";
import UserRouter from "./modules/user/user.routes.js";

const app = express();

//middleware
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

//routes
app.get("/", (_req: Request, res: Response) => {
  res.send(`Your API is running on port: ${PORT}`);
});

app.use("/api/auth", AuthRouter);
app.use("/api/users", UserRouter);

//route not found handler
app.use((_req, _res, next) => {
  next(new AppError(404, "Route not found"));
});

//errorHandler
app.use(errorHandler);

export default app;
