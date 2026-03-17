import type { Response, Request, NextFunction } from "express";
import { z } from "zod";

type ValidationTarget = "body" | "query" | "params";

class InputValidator {
  public schema(schema: z.ZodType, target: ValidationTarget) {
    return (req: Request, _res: Response, next: NextFunction) => {
      try {
        req.validated ??= {};
        req.validated[target] = schema.parse(req[target]);
        next();
      } catch (error) {
        console.error("message:", error);
        next(error);
      }
    };
  }
}

export const inputValidator = new InputValidator();
