import type { Request, Response, NextFunction } from "express";
import { AppError } from "../class/appError.js";
import { ZodError } from "zod";
import { Prisma } from "../../generated/prisma/client.js";

class ErrorHandler {
  public handle = (
    err: unknown,
    _req: Request,
    res: Response,
    _next: NextFunction,
  ) => {
    if (err instanceof AppError) {
      console.log(err.message);
      return res.status(err.statusCode).json({
        message: err.message,
      });
    }

    if (err instanceof Prisma.PrismaClientValidationError) {
      console.error("Prisma validation error:", err);

      return res.status(400).json({
        message: "Invalid database input",
      });
    }

    if (err instanceof ZodError) {
      console.log(err.issues);
      return res.status(400).json({ message: err.issues[0]?.message });
    }

    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      switch (err.code) {
        case "P2002":
          return res.status(409).json({
            message: "Already exists",
          });

        case "P2025":
          return res.status(404).json({
            message: "Record not found",
          });

        default:
          return res.status(400).json({
            message: "Database error",
          });
      }
    }

    if (err instanceof Error) {
      console.error(err);
      return res.status(500).json({
        message: err.message,
      });
    }

    return res.status(500).json({ message: "Internal Server Error" });
  };
}

export const errorHandler = new ErrorHandler();
