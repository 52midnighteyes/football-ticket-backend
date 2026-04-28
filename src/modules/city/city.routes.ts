import { Router } from "express";
import { validateSchema } from "../../middlewares/zodValidator.middleware.js";
import { getCitiesController } from "./city.controller.js";
import { getCitiesQuerySchema } from "./city.schemas.js";

const router = Router();

router.get("/", validateSchema(getCitiesQuerySchema, "query"), getCitiesController);

export default router;
