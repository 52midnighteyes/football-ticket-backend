import type { NextFunction, Request, Response } from "express";
import type { TGetCategoriesQuery } from "./category.schemas.js";
import { getCategoriesService } from "./category.service.js";

export const getCategoriesController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const query = (req.validated?.query ?? {}) as TGetCategoriesQuery;
    const data = await getCategoriesService(query);

    res.status(200).json({
      message: "Categories fetched successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};
