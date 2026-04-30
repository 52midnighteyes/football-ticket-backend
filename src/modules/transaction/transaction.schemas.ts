import * as zod from "zod";
import { TransactionStatus } from "../../../generated/prisma/enums.js";

const sortOrderSchema = zod.enum(["asc", "desc"]);
const organizerTransactionSortBySchema = zod.enum([
  "createdAt",
  "updatedAt",
  "expiredAt",
  "paymentProofUploadedAt",
  "adminActionAt",
  "totalAmount",
  "finalAmount",
  "status",
]);
const revenueGroupBySchema = zod.enum(["year", "month", "day"]);

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

export const getOrganizerTransactionsQuerySchema = zod.object({
  id: zod.uuid("Transaction ID must be a valid UUID").optional(),
  organizerId: zod.uuid("Organizer ID must be a valid UUID").optional(),
  eventId: zod.uuid("Event ID must be a valid UUID").optional(),
  userId: zod.uuid("User ID must be a valid UUID").optional(),
  status: zod.enum(TransactionStatus).optional(),
  eventNameLike: zod
    .string()
    .trim()
    .min(1, "Event nameLike is required")
    .optional(),
  buyerNameLike: zod
    .string()
    .trim()
    .min(1, "Buyer nameLike is required")
    .optional(),
  buyerEmailLike: zod
    .string()
    .trim()
    .min(1, "Buyer emailLike is required")
    .optional(),
  sortBy: organizerTransactionSortBySchema.optional(),
  sortOrder: sortOrderSchema.optional(),
  page: zod.coerce.number().int().min(1).default(1),
  limit: zod.coerce.number().int().min(1).max(100).default(10),
});

export const getOrganizerRevenueQuerySchema = zod
  .object({
    groupBy: revenueGroupBySchema.default("year"),
    year: zod.coerce.number().int().min(2000).max(9999).optional(),
    month: zod.coerce.number().int().min(1).max(12).optional(),
    organizerId: zod.uuid("Organizer ID must be a valid UUID").optional(),
  })
  .superRefine((data, ctx) => {
    if (data.groupBy === "month" && !data.year) {
      ctx.addIssue({
        code: "custom",
        message: "Year is required when groupBy is month",
        path: ["year"],
      });
    }

    if (data.groupBy === "day") {
      if (!data.year) {
        ctx.addIssue({
          code: "custom",
          message: "Year is required when groupBy is day",
          path: ["year"],
        });
      }

      if (!data.month) {
        ctx.addIssue({
          code: "custom",
          message: "Month is required when groupBy is day",
          path: ["month"],
        });
      }
    }
  });

export const transactionIdParamsSchema = zod.object({
  id: zod.uuid("Transaction ID must be a valid UUID"),
});

export const checkVoucherQuerySchema = zod.object({
  eventId: zod.uuid("Event ID must be a valid UUID"),
  code: zod.string().trim().min(1, "Voucher code is required"),
});

export const updateTransactionStatusBodySchema = zod.object({
  status: zod.enum(["DONE", "REJECTED"]),
});

export type TCreateTransactionBody = zod.infer<
  typeof createTransactionBodySchema
>;
export type TGetMyTransactionsQuery = zod.infer<
  typeof getMyTransactionsQuerySchema
>;
export type TGetOrganizerTransactionsQuery = zod.infer<
  typeof getOrganizerTransactionsQuerySchema
>;
export type TGetOrganizerRevenueQuery = zod.infer<
  typeof getOrganizerRevenueQuerySchema
>;
export type TTransactionIdParams = zod.infer<typeof transactionIdParamsSchema>;
export type TCheckVoucherQuery = zod.infer<typeof checkVoucherQuerySchema>;
export type TUpdateTransactionStatusBody = zod.infer<
  typeof updateTransactionStatusBodySchema
>;
