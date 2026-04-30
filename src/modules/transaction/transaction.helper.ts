import type { TransactionStatus } from "../../../generated/prisma/enums.js";
import { AppError } from "../../class/appError.js";
import { FRONTEND_URL } from "../../config/config.js";
import { generateTicketCode } from "../../helper/stringGenerator.js";
import { compileHandlebars } from "../../helper/handlebars.js";
import { EMAIL_TEMPLATES_DIR } from "../../helper/path.js";
import {
  deleteFromCloudinary,
  getPublicIdFromCloudinaryUrl,
} from "../../libs/cloudinary/cloudinary.lib.js";
import { sendMail } from "../../libs/mailer/nodemailer.libs.js";
import { prisma } from "../../libs/prisma/prisma.lib.js";
import type { TPrisma } from "../../libs/prisma/prisma.types.js";
import {
  findAvailableCouponById,
  releaseCouponById,
  reserveCouponById,
} from "../coupon/coupon.repository.js";
import {
  createPointHistory,
  findAvailablePointsByUser,
  reservePointAmount,
} from "../point/point.repository.js";
import { createTicket } from "../ticket/ticket.repository.js";
import {
  releaseVoucherById,
  reserveVoucherById,
} from "../voucher/voucher.repository.js";
import {
  claimExpiredTransactionById,
  findExpiredPendingTransactions,
  findTicketTypeById,
  markTicketTypeSoldOut,
  releaseTicketType,
  reserveTicketType,
} from "./transaction.repository.js";

const TWO_HOURS_IN_MS = 2 * 60 * 60 * 1000;
const THREE_HOURS_IN_MS = 3 * 60 * 60 * 1000;

type RestorableTransaction = {
  id: string;
  voucherId: string | null;
  couponId: string | null;
  transactionItems: Array<{
    ticketTypeId: string;
    quantity: number;
  }>;
  pointHistories: Array<{
    pointId: string;
    userId: string;
    amount: number;
  }>;
};

type TicketIssuableTransaction = {
  id: string;
  userId: string;
  transactionItems: Array<{
    id: string;
    quantity: number;
  }>;
};

export type PointAllocation = {
  pointId: string;
  userId: string;
  amount: number;
};

const formatDateTime = (value: Date | null) => {
  if (!value) return null;

  return value.toLocaleString("id-ID", {
    dateStyle: "full",
    timeStyle: "short",
  });
};

export const calculateTransactionAmounts = (params: {
  totalAmount: number;
  voucherAmount: number;
  couponAmount: number;
  pointsToUse: number;
}) => {
  const maxPointsThatCanBeUsed =
    params.totalAmount - params.voucherAmount - params.couponAmount;

  if (params.voucherAmount + params.couponAmount > params.totalAmount) {
    throw new AppError(
      400,
      "Voucher and coupon amount exceed the ticket price",
    );
  }

  if (params.pointsToUse > maxPointsThatCanBeUsed) {
    throw new AppError(400, "Points amount exceeds the payable amount");
  }

  const finalAmount =
    params.totalAmount -
    params.voucherAmount -
    params.couponAmount -
    params.pointsToUse;

  return {
    finalAmount,
    paymentRequired: finalAmount > 0,
    status: (finalAmount > 0 ? "WAITING_FOR_PAYMENT" : "DONE") as TransactionStatus,
    expiredAt: finalAmount > 0 ? new Date(Date.now() + TWO_HOURS_IN_MS) : null,
  };
};

export const buildPointAllocations = async (
  userId: string,
  pointsToUse: number,
  now: Date,
) => {
  if (pointsToUse <= 0) return [] as PointAllocation[];

  const availablePoints = await findAvailablePointsByUser(userId, now);

  const sortedPoints = [...availablePoints].sort((a, b) => {
    const aExpiresAt =
      a.pointHistories[0]?.expiresAt?.getTime() ?? Number.MAX_SAFE_INTEGER;
    const bExpiresAt =
      b.pointHistories[0]?.expiresAt?.getTime() ?? Number.MAX_SAFE_INTEGER;

    if (aExpiresAt !== bExpiresAt) {
      return aExpiresAt - bExpiresAt;
    }

    return a.createdAt.getTime() - b.createdAt.getTime();
  });

  const totalAvailablePoints = sortedPoints.reduce(
    (sum, point) => sum + point.pointLeft,
    0,
  );

  if (totalAvailablePoints < pointsToUse) {
    throw new AppError(400, "Insufficient points");
  }

  const allocations: PointAllocation[] = [];
  let remaining = pointsToUse;

  for (const point of sortedPoints) {
    if (remaining <= 0) break;

    const amount = Math.min(point.pointLeft, remaining);
    allocations.push({
      pointId: point.id,
      userId: point.userId,
      amount,
    });
    remaining -= amount;
  }

  return allocations;
};

export const getAvailablePointBalance = async (
  userId: string,
  now: Date,
) => {
  const points = await findAvailablePointsByUser(userId, now);

  return points.reduce((sum, point) => sum + point.pointLeft, 0);
};

export const assertPaymentProofUploadable = (status: TransactionStatus) => {
  if (status !== "WAITING_FOR_PAYMENT") {
    throw new AppError(
      409,
      "Payment proof can only be uploaded while waiting for payment",
    );
  }
};

export const getAdminConfirmationExpiredAt = (now: Date) => {
  return new Date(now.getTime() + THREE_HOURS_IN_MS);
};

export const assertTransactionReviewable = (status: TransactionStatus) => {
  if (
    status === "REJECTED" ||
    status === "EXPIRED" ||
    status === "CANCELED" ||
    status === "DONE"
  ) {
    throw new AppError(409, "Transaction status can no longer be changed");
  }

  if (status !== "WAITING_FOR_ADMIN_CONFIRMATION") {
    throw new AppError(
      409,
      "Transaction is still waiting for customer payment proof",
    );
  }
};

export const reserveTransactionResources = async (params: {
  tx: TPrisma;
  eventId: string;
  ticketTypeId: string;
  voucherId?: string | null;
  couponId?: string | null;
  pointAllocations: PointAllocation[];
  usedAt: Date;
}) => {
  const reserveTicket = await reserveTicketType(
    params.ticketTypeId,
    params.eventId,
    params.tx,
  );

  if (reserveTicket.count === 0) {
    throw new AppError(409, "Ticket type is sold out");
  }

  const reservedTicketType = await findTicketTypeById(
    params.ticketTypeId,
    params.tx,
  );

  if (
    reservedTicketType &&
    reservedTicketType.quota === 0 &&
    !reservedTicketType.isSoldOut
  ) {
    await markTicketTypeSoldOut(params.ticketTypeId, params.tx);
  }

  if (params.voucherId) {
    const reserveVoucher = await reserveVoucherById(params.voucherId, params.tx);

    if (reserveVoucher.count === 0) {
      throw new AppError(409, "Voucher is no longer available");
    }
  }

  if (params.couponId) {
    const reserveCoupon = await reserveCouponById(
      params.couponId,
      params.usedAt,
      params.tx,
    );

    if (reserveCoupon.count === 0) {
      throw new AppError(409, "Coupon is no longer available");
    }
  }

  for (const allocation of params.pointAllocations) {
    const reservePoint = await reservePointAmount(
      allocation.pointId,
      allocation.amount,
      params.tx,
    );

    if (reservePoint.count === 0) {
      throw new AppError(409, "Insufficient points");
    }
  }
};

export const createUsedPointHistories = async (params: {
  tx: TPrisma;
  transactionId: string;
  pointAllocations: PointAllocation[];
}) => {
  for (const allocation of params.pointAllocations) {
    await createPointHistory(
      {
        pointId: allocation.pointId,
        userId: allocation.userId,
        transactionId: params.transactionId,
        amount: allocation.amount,
        type: "USED",
        source: "TRANSACTION_USAGE",
      },
      params.tx,
    );
  }
};

export const restoreTransactionResources = async (params: {
  tx: TPrisma;
  transaction: RestorableTransaction;
}) => {
  for (const item of params.transaction.transactionItems) {
    await releaseTicketType(item.ticketTypeId, item.quantity, params.tx);
  }

  if (params.transaction.voucherId) {
    await releaseVoucherById(params.transaction.voucherId, params.tx);
  }

  if (params.transaction.couponId) {
    await releaseCouponById(params.transaction.couponId, params.tx);
  }

  for (const pointHistory of params.transaction.pointHistories) {
    await params.tx.point.update({
      where: {
        id: pointHistory.pointId,
      },
      data: {
        pointLeft: {
          increment: pointHistory.amount,
        },
        pointUsed: {
          decrement: pointHistory.amount,
        },
      },
    });

    await createPointHistory(
      {
        pointId: pointHistory.pointId,
        userId: pointHistory.userId,
        transactionId: params.transaction.id,
        amount: pointHistory.amount,
        type: "REFUNDED",
        source: "TRANSACTION_REFUND",
      },
      params.tx,
    );
  }
};

export const createTicketsForTransaction = async (params: {
  tx: TPrisma;
  transaction: TicketIssuableTransaction;
}) => {
  const tickets = [];

  for (const item of params.transaction.transactionItems) {
    for (let index = 0; index < item.quantity; index += 1) {
      const ticket = await createTicket(
        {
          transactionItemId: item.id,
          transactionId: params.transaction.id,
          userId: params.transaction.userId,
          code: generateTicketCode(),
        },
        params.tx,
      );

      tickets.push(ticket);
    }
  }

  return tickets;
};

export const deleteCloudinaryAssetByUrl = async (url?: string | null) => {
  if (!url) return;

  const publicId = getPublicIdFromCloudinaryUrl(url);
  if (!publicId) return;

  await deleteFromCloudinary(publicId);
};

export const syncExpiredTransactions = async (): Promise<void> => {
  const now = new Date();
  const expiredTransactions = await findExpiredPendingTransactions(now);

  if (expiredTransactions.length === 0) return;

  await prisma.$transaction(
    async (tx) => {
      for (const transaction of expiredTransactions) {
        const claimExpired = await claimExpiredTransactionById(
          transaction.id,
          now,
          tx,
        );

        if (claimExpired.count === 0) {
          continue;
        }

        await restoreTransactionResources({
          tx,
          transaction,
        });
      }
    },
    {
      maxWait: 10_000,
      timeout: 120_000,
    },
  );
};

export const validateCouponOwnership = async (params: {
  userId: string;
  couponId?: string;
  now: Date;
}) => {
  if (!params.couponId) return null;

  const coupon = await findAvailableCouponById(
    params.userId,
    params.couponId,
    params.now,
  );

  if (!coupon) {
    throw new AppError(400, "Coupon is invalid");
  }

  return coupon;
};

export const sendTransactionCreatedEmail = async (params: {
  email: string;
  firstName: string;
  eventName: string;
  venue: string;
  startAt: Date;
  expiredAt: Date | null;
  totalAmount: number;
  couponAmount: number;
  voucherAmount: number;
  pointsAmount: number;
  finalAmount: number;
  transactionId: string;
  paymentRequired: boolean;
}) => {
  const html = await compileHandlebars(
    EMAIL_TEMPLATES_DIR,
    "transaction-created.mail.hbs",
    {
      ...params,
      startAtFormatted: formatDateTime(params.startAt),
      expiredAtFormatted: formatDateTime(params.expiredAt),
      profileUrl: `${FRONTEND_URL}/profile`,
    },
  );

  await sendMail(params.email, "Your purchase has been processed", html);
};

export const sendTransactionPaymentRejectedEmail = async (params: {
  email: string;
  firstName: string;
  eventName: string;
  venue: string;
  startAt: Date;
  totalAmount: number;
  couponAmount: number;
  voucherAmount: number;
  pointsAmount: number;
  finalAmount: number;
}) => {
  const html = await compileHandlebars(
    EMAIL_TEMPLATES_DIR,
    "transaction-payment-rejected.mail.hbs",
    {
      ...params,
      startAtFormatted: formatDateTime(params.startAt),
      profileUrl: `${FRONTEND_URL}/profile`,
    },
  );

  await sendMail(params.email, "Your payment proof was rejected", html);
};

export const sendTransactionPaymentAcceptedEmail = async (params: {
  email: string;
  firstName: string;
  eventName: string;
  venue: string;
  startAt: Date;
  totalAmount: number;
  couponAmount: number;
  voucherAmount: number;
  pointsAmount: number;
  finalAmount: number;
  tickets: Array<{
    code: string;
  }>;
}) => {
  const html = await compileHandlebars(
    EMAIL_TEMPLATES_DIR,
    "transaction-payment-accepted.mail.hbs",
    {
      ...params,
      startAtFormatted: formatDateTime(params.startAt),
      profileUrl: `${FRONTEND_URL}/profile`,
    },
  );

  await sendMail(params.email, "Your payment has been accepted", html);
};
