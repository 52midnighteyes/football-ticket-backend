import { Router } from "express";
import { verifyAccessToken } from "../../middlewares/tokenVerification/tokenVerification.middleware.js";
import { validateSchema } from "../../middlewares/zodValidator.middleware.js";
import {
  checkCouponController,
  checkVoucherController,
  createTransactionController,
  getMyCouponsController,
  getMyTransactionsController,
} from "./transaction.controller.js";
import {
  checkCouponQuerySchema,
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

router.get(
  "/coupons/check",
  verifyAccessToken,
  validateSchema(checkCouponQuerySchema, "query"),
  checkCouponController,
);

router.get("/coupons/me", verifyAccessToken, getMyCouponsController);

export default router;
