import { Router } from "express";
import { UserRole } from "../../../generated/prisma/enums.js";
import { upload } from "../../middlewares/multer.middleware.js";
import { roleGuard } from "../../middlewares/roleGuard.middleware.js";
import { verifyAccessToken } from "../../middlewares/tokenVerification/tokenVerification.middleware.js";
import { validateSchema } from "../../middlewares/zodValidator.middleware.js";
import {
  checkVoucherController,
  createTransactionController,
  getMyAvailablePointsController,
  getMyCouponsController,
  getOrganizerRevenueAnalyticsController,
  getOrganizerTransactionsController,
  getMyTransactionsController,
  reviewTransactionController,
  uploadTransactionPaymentProofController,
} from "./transaction.controller.js";
import {
  checkVoucherQuerySchema,
  createTransactionBodySchema,
  getOrganizerRevenueQuerySchema,
  getOrganizerTransactionsQuerySchema,
  getMyTransactionsQuerySchema,
  transactionIdParamsSchema,
  updateTransactionStatusBodySchema,
} from "./transaction.schemas.js";

const router = Router();

router.post(
  "/",
  verifyAccessToken,
  roleGuard(UserRole.CUSTOMER),
  validateSchema(createTransactionBodySchema, "body"),
  createTransactionController,
);

router.get(
  "/me",
  verifyAccessToken,
  validateSchema(getMyTransactionsQuerySchema, "query"),
  getMyTransactionsController,
);

router.get(
  "/organizer/me",
  verifyAccessToken,
  roleGuard(UserRole.ORGANIZER, UserRole.ADMIN),
  validateSchema(getOrganizerTransactionsQuerySchema, "query"),
  getOrganizerTransactionsController,
);

router.get(
  "/organizer/revenue",
  verifyAccessToken,
  roleGuard(UserRole.ORGANIZER, UserRole.ADMIN),
  validateSchema(getOrganizerRevenueQuerySchema, "query"),
  getOrganizerRevenueAnalyticsController,
);

router.get(
  "/vouchers/check",
  verifyAccessToken,
  validateSchema(checkVoucherQuerySchema, "query"),
  checkVoucherController,
);

router.get("/coupons/me", verifyAccessToken, getMyCouponsController);

router.get("/points/me", verifyAccessToken, getMyAvailablePointsController);

router.patch(
  "/:id/payment-proof",
  verifyAccessToken,
  validateSchema(transactionIdParamsSchema, "params"),
  upload.single("paymentProof"),
  uploadTransactionPaymentProofController,
);

router.patch(
  "/:id/status",
  verifyAccessToken,
  roleGuard(UserRole.ORGANIZER, UserRole.ADMIN),
  validateSchema(transactionIdParamsSchema, "params"),
  validateSchema(updateTransactionStatusBodySchema, "body"),
  reviewTransactionController,
);

export default router;
