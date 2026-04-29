import type { NextFunction, Request, Response } from "express";
import {
  getCitiesService,
  getCountriesService,
  getProvincesService,
} from "./location.service.js";
import type {
  TGetCitiesQuery,
  TGetCountriesQuery,
  TGetProvincesQuery,
} from "./location.schemas.js";

export const getCountriesController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const query = (req.validated?.query ?? {}) as TGetCountriesQuery;
    const data = await getCountriesService(query);

    res.status(200).json({
      message: "Countries fetched successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const getProvincesController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const query = (req.validated?.query ?? {}) as TGetProvincesQuery;
    const data = await getProvincesService(query);

    res.status(200).json({
      message: "Provinces fetched successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

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
