import type { NextFunction, Request, Response } from "express";
import type { TGetCitiesQuery } from "./city.schemas.js";
import { getCitiesService } from "./city.service.js";

export const getCitiesController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const query = (req.validated?.query ?? {}) as TGetCitiesQuery;
    const data = await getCitiesService(query);

    res.status(200).json({
      message: "Cities fetched successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};
