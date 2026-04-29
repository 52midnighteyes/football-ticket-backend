import * as zod from "zod";
import { TransactionStatus } from "../../../generated/prisma/enums.js";

export const createTransactionBodySchema = zod.object({
  eventId: zod.uuid("Event ID must be a valid UUID"),
  ticketTypeId: zod.uuid("Ticket type ID must be a valid UUID"),
  voucherCode: zod.string().trim().min(1).optional(),
  couponCode: zod.string().trim().min(1).optional(),
  pointsToUse: zod.coerce
    .number("Points to use must be a valid number")
    .int("Points to use must be an integer")
    .min(0, "Points to use must be at least 0")
    .default(0),
});

export const getMyTransactionsQuerySchema = zod.object({
  status: zod.enum(TransactionStatus).optional(),
});

export const checkVoucherQuerySchema = zod.object({
  eventId: zod.uuid("Event ID must be a valid UUID"),
  code: zod.string().trim().min(1, "Voucher code is required"),
});

export const checkCouponQuerySchema = zod.object({
  code: zod.string().trim().min(1, "Coupon code is required"),
});

export type TCreateTransactionBody = zod.infer<
  typeof createTransactionBodySchema
>;
export type TGetMyTransactionsQuery = zod.infer<
  typeof getMyTransactionsQuerySchema
>;
export type TCheckVoucherQuery = zod.infer<typeof checkVoucherQuerySchema>;
export type TCheckCouponQuery = zod.infer<typeof checkCouponQuerySchema>;
