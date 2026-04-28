import { Router } from "express";
import { validateSchema } from "../../middlewares/zodValidator.middleware.js";
import { getCategoriesController } from "./category.controller.js";
import { getCategoriesQuerySchema } from "./category.schemas.js";

const router = Router();

router.get(
  "/",
  validateSchema(getCategoriesQuerySchema, "query"),
  getCategoriesController,
);

export default router;
