import { Router } from "express";
import { UserRole } from "../../../generated/prisma/enums.js";
import { roleGuard } from "../../middlewares/roleGuard.middleware.js";
import { verifyAccessToken } from "../../middlewares/tokenVerification/tokenVerification.middleware.js";
import { validateSchema } from "../../middlewares/zodValidator.middleware.js";
import {
  createEventBodySchema,
  createTicketTypesBodySchema,
  eventIdParamsSchema,
  getEventsQuerySchema,
  organizerEventParamsSchema,
  updateEventBodySchema,
} from "./event.schemas.js";
import {
  createEventController,
  createTicketTypeController,
  deleteEventController,
  getEventsController,
  updateEventController,
} from "./event.controller.js";
import { upload } from "../../middlewares/multer.middleware.js";

const router = Router();

router.get(
  "/",
  validateSchema(getEventsQuerySchema, "query"),
  getEventsController,
);

router.post(
  "/organizer/:id",
  verifyAccessToken,
  roleGuard(UserRole.ORGANIZER, UserRole.ADMIN),
  validateSchema(organizerEventParamsSchema, "params"),
  upload.single("bannerUrl"),
  validateSchema(createEventBodySchema, "body"),
  createEventController,
);

router.put(
  "/:id",
  verifyAccessToken,
  roleGuard(UserRole.ORGANIZER, UserRole.ADMIN),
  validateSchema(eventIdParamsSchema, "params"),
  upload.single("bannerUrl"),
  validateSchema(updateEventBodySchema, "body"),
  updateEventController,
);

router.delete(
  "/:id",
  verifyAccessToken,
  roleGuard(UserRole.ORGANIZER, UserRole.ADMIN),
  validateSchema(eventIdParamsSchema, "params"),
  deleteEventController,
);

router.post(
  "/:id/ticket-types",
  verifyAccessToken,
  roleGuard(UserRole.ORGANIZER, UserRole.ADMIN),
  validateSchema(eventIdParamsSchema, "params"),
  validateSchema(createTicketTypesBodySchema, "body"),
  createTicketTypeController,
);

export default router;
