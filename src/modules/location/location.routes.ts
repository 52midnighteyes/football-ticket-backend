import { Router } from "express";
import { validateSchema } from "../../middlewares/zodValidator.middleware.js";
import {
  getCitiesController,
  getCountriesController,
  getProvincesController,
} from "./location.controller.js";
import {
  getCitiesQuerySchema,
  getCountriesQuerySchema,
  getProvincesQuerySchema,
} from "./location.schemas.js";

const router = Router();

router.get(
  "/countries",
  validateSchema(getCountriesQuerySchema, "query"),
  getCountriesController,
);

router.get(
  "/provinces",
  validateSchema(getProvincesQuerySchema, "query"),
  getProvincesController,
);

router.get(
  "/cities",
  validateSchema(getCitiesQuerySchema, "query"),
  getCitiesController,
);

export default router;
