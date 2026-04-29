import express, { NextFunction, type Request, type Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import { FRONTEND_URL, PORT } from "./config/config.js";
import helmet from "helmet";
import { AppError } from "./class/appError.js";
import { errorHandler } from "./middlewares/errorHandler.middleware.js";

import AuthRouter from "./modules/auth/auth.route.js";
import UserRouter from "./modules/user/user.routes.js";
import EventRouter from "./modules/event/event.routes.js";
import CategoryRouter from "./modules/category/category.routes.js";
import LocationRouter from "./modules/location/location.routes.js";
import TransactionRouter from "./modules/transaction/transaction.routes.js";

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

app.use((req: Request, _res: Response, next: NextFunction) => {
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

app.use("/", (req: Request, _res: Response, next: NextFunction) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});

//routes
app.get("/", (_req: Request, res: Response) => {
  res.send(`Your API is running on port: ${PORT}`);
});

app.use("/api/auth", AuthRouter);
app.use("/api/users", UserRouter);
app.use("/api/event", EventRouter);
app.use("/api/locations", LocationRouter);
app.use("/api/categories", CategoryRouter);
app.use("/api/transactions", TransactionRouter);

//route not found handler
app.use((_req, _res, next) => {
  next(new AppError(404, "Route not found"));
});

//errorHandler
app.use(errorHandler);

export default app;
