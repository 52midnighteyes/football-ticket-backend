import { Router } from "express";
import { UserRole } from "../../../generated/prisma/enums.js";
import { roleGuard } from "../../middlewares/roleGuard.middleware.js";
import { verifyAccessToken } from "../../middlewares/tokenVerification/tokenVerification.middleware.js";
import { validateSchema } from "../../middlewares/zodValidator.middleware.js";
import {
  checkInTicketController,
  getTicketAttendanceStatsController,
  getTicketsController,
} from "./ticket.controller.js";
import {
  checkInTicketBodySchema,
  getTicketAttendanceStatsQuerySchema,
  getTicketsQuerySchema,
} from "./ticket.schemas.js";

const router = Router();

router.get(
  "/attendance-stats",
  verifyAccessToken,
  roleGuard(UserRole.ORGANIZER, UserRole.ADMIN),
  validateSchema(getTicketAttendanceStatsQuerySchema, "query"),
  getTicketAttendanceStatsController,
);

router.get(
  "/",
  verifyAccessToken,
  validateSchema(getTicketsQuerySchema, "query"),
  getTicketsController,
);

router.patch(
  "/check-in",
  verifyAccessToken,
  roleGuard(UserRole.ORGANIZER, UserRole.ADMIN),
  validateSchema(checkInTicketBodySchema, "body"),
  checkInTicketController,
);

export default router;
