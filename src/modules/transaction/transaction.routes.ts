import { Router } from "express";
import { verifyAccessToken } from "../../middlewares/tokenVerification/tokenVerification.middleware.js";
import { validateSchema } from "../../middlewares/zodValidator.middleware.js";
import {
  checkVoucherController,
  createTransactionController,
  getMyAvailablePointsController,
  getMyCouponsController,
  getMyTransactionsController,
} from "./transaction.controller.js";
import {
  checkVoucherQuerySchema,
  createTransactionBodySchema,
  getMyTransactionsQuerySchema,
} from "./transaction.schemas.js";

const router = Router();

router.post(
  "/",
  verifyAccessToken,
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
  "/vouchers/check",
  verifyAccessToken,
  validateSchema(checkVoucherQuerySchema, "query"),
  checkVoucherController,
);

router.get("/coupons/me", verifyAccessToken, getMyCouponsController);

router.get("/points/me", verifyAccessToken, getMyAvailablePointsController);

export default router;
