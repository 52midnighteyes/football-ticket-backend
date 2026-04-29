import type { TransactionStatus } from "../../../generated/prisma/enums.js";
import { AppError } from "../../class/appError.js";
import { FRONTEND_URL } from "../../config/config.js";
import { compileHandlebars } from "../../helper/handlebars.js";
import { EMAIL_TEMPLATES_DIR } from "../../helper/path.js";
import { sendMail } from "../../libs/mailer/nodemailer.libs.js";
import { prisma } from "../../libs/prisma/prisma.lib.js";
import type { TPrisma } from "../../libs/prisma/prisma.types.js";
import {
  findAvailableCouponById,
  releaseCouponById,
  reserveCouponById,
} from "../coupon/coupon.repository.js";
import {
  reservePointAmount,
  createPointHistory,
  findAvailablePointsByUser,
} from "../point/point.repository.js";
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

export type PointAllocation = {
  pointId: string;
  userId: string;
  amount: number;
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

  const reservedTicketType = await findTicketTypeById(params.ticketTypeId, params.tx);

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

        for (const item of transaction.transactionItems) {
          await releaseTicketType(item.ticketTypeId, item.quantity, tx);
        }

        if (transaction.voucherId) {
          await releaseVoucherById(transaction.voucherId, tx);
        }

        if (transaction.couponId) {
          await releaseCouponById(transaction.couponId, tx);
        }

        for (const pointHistory of transaction.pointHistories) {
          await tx.point.update({
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
              transactionId: transaction.id,
              amount: pointHistory.amount,
              type: "REFUNDED",
              source: "TRANSACTION_REFUND",
            },
            tx,
          );
        }

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
      startAtFormatted: params.startAt.toLocaleString("id-ID", {
        dateStyle: "full",
        timeStyle: "short",
      }),
      expiredAtFormatted: params.expiredAt
        ? params.expiredAt.toLocaleString("id-ID", {
            dateStyle: "full",
            timeStyle: "short",
          })
        : null,
      profileUrl: `${FRONTEND_URL}/profile`,
    },
  );

  await sendMail(params.email, "Your purchase has been processed", html);
};
