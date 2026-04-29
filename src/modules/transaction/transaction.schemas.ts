import * as zod from "zod";
import { TransactionStatus } from "../../../generated/prisma/enums.js";

const emptyStringToUndefined = (value: unknown) => {
  if (typeof value !== "string") return value;

  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
};

const booleanLikeSchema = zod.preprocess((value) => {
  if (value === undefined) return false;
  if (typeof value !== "string") return value;

  const normalized = value.trim().toLowerCase();

  if (normalized === "true") return true;
  if (normalized === "false") return false;

  return value;
}, zod.boolean());

export const createTransactionBodySchema = zod.object({
  eventId: zod.uuid("Event ID must be a valid UUID"),
  ticketTypeId: zod.uuid("Ticket type ID must be a valid UUID"),
  voucherCode: zod.preprocess(
    emptyStringToUndefined,
    zod.string().trim().min(1).optional(),
  ),
  couponId: zod.preprocess(
    emptyStringToUndefined,
    zod.uuid("Coupon ID must be a valid UUID").optional(),
  ),
  usePoints: booleanLikeSchema,
});

export const getMyTransactionsQuerySchema = zod.object({
  status: zod.enum(TransactionStatus).optional(),
});

export const checkVoucherQuerySchema = zod.object({
  eventId: zod.uuid("Event ID must be a valid UUID"),
  code: zod.string().trim().min(1, "Voucher code is required"),
});

export type TCreateTransactionBody = zod.infer<
  typeof createTransactionBodySchema
>;
export type TGetMyTransactionsQuery = zod.infer<
  typeof getMyTransactionsQuerySchema
>;
export type TCheckVoucherQuery = zod.infer<typeof checkVoucherQuerySchema>;
