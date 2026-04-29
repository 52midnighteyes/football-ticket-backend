import type { Prisma } from "../../../generated/prisma/client.js";
import type { TransactionStatus } from "../../../generated/prisma/enums.js";
import { AppError } from "../../class/appError.js";
import { FRONTEND_URL } from "../../config/config.js";
import { EMAIL_TEMPLATES_DIR } from "../../helper/path.js";
import { compileHandlebars } from "../../helper/handlebars.js";
import { generateCouponCode } from "../../helper/stringGenerator.js";
import { sendMail } from "../../libs/mailer/nodemailer.libs.js";
import { prisma } from "../../libs/prisma/prisma.lib.js";
import { findUserById } from "../user/user.repository.js";
import {
  createTransactionWithItem,
  findAvailableCouponByCode,
  findAvailableCouponsByUser,
  findAvailablePointsByUser,
  findAvailableVoucherByCode,
  findExpiredPendingTransactions,
  findMyTransactions,
  findPurchasableEventById,
  findUserTransactionByEvent,
} from "./transaction.repository.js";
import type {
  TCheckCouponQuery,
  TCheckVoucherQuery,
  TCreateTransactionBody,
  TGetMyTransactionsQuery,
} from "./transaction.schemas.js";

const TWO_HOURS_IN_MS = 2 * 60 * 60 * 1000;

type PointAllocation = {
  pointId: string;
  userId: string;
  amount: number;
};

const sortPointRecordsForUsage = <
  T extends {
    createdAt: Date;
    pointHistories: Array<{
      expiresAt: Date | null;
      createdAt: Date;
    }>;
  },
>(
  points: T[],
) => {
  return [...points].sort((a, b) => {
    const aExpiresAt = a.pointHistories[0]?.expiresAt?.getTime() ?? Number.MAX_SAFE_INTEGER;
    const bExpiresAt = b.pointHistories[0]?.expiresAt?.getTime() ?? Number.MAX_SAFE_INTEGER;

    if (aExpiresAt !== bExpiresAt) {
      return aExpiresAt - bExpiresAt;
    }

    return a.createdAt.getTime() - b.createdAt.getTime();
  });
};

const buildPointAllocations = async (
  userId: string,
  pointsToUse: number,
  now: Date,
): Promise<PointAllocation[]> => {
  if (pointsToUse <= 0) return [];

  const availablePoints = await findAvailablePointsByUser(userId, now);
  const sortedPoints = sortPointRecordsForUsage(availablePoints);

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

const syncExpiredTransactions = async (): Promise<void> => {
  const now = new Date();
  const expiredTransactions = await findExpiredPendingTransactions(now);

  if (expiredTransactions.length === 0) {
    return;
  }

  await prisma.$transaction(
    async (tx) => {
      for (const transaction of expiredTransactions) {
        for (const item of transaction.transactionItems) {
          await tx.ticketType.update({
            where: {
              id: item.ticketTypeId,
            },
            data: {
              quota: {
                increment: item.quantity,
              },
              isSoldOut: false,
            },
          });
        }

        if (transaction.voucherId) {
          await tx.voucher.update({
            where: {
              id: transaction.voucherId,
            },
            data: {
              quota: {
                increment: 1,
              },
            },
          });
        }

        if (transaction.couponId) {
          await tx.coupon.update({
            where: {
              id: transaction.couponId,
            },
            data: {
              usedAt: null,
            },
          });
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

          await tx.pointHistory.create({
            data: {
              pointId: pointHistory.pointId,
              userId: pointHistory.userId,
              transactionId: transaction.id,
              amount: pointHistory.amount,
              type: "REFUNDED",
              source: "TRANSACTION_REFUND",
            },
          });
        }

        await tx.transaction.update({
          where: {
            id: transaction.id,
          },
          data: {
            status: "EXPIRED",
          },
        });
      }
    },
    {
      maxWait: 10_000,
      timeout: 120_000,
    },
  );
};

const sendTransactionEmail = async (params: {
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

const ensureCouponCodesForUser = async (userId: string): Promise<void> => {
  const couponsWithoutCode = await prisma.coupon.findMany({
    where: {
      userId,
      code: null,
    },
    select: {
      id: true,
    },
  });

  for (const coupon of couponsWithoutCode) {
    await prisma.coupon.update({
      where: {
        id: coupon.id,
      },
      data: {
        code: generateCouponCode(),
      },
    });
  }
};

export const createTransactionService = async (
  userId: string,
  payload: TCreateTransactionBody,
) => {
  await syncExpiredTransactions();

  const now = new Date();
  const user = await findUserById(userId);

  if (!user) {
    throw new AppError(404, "User not found");
  }

  const event = await findPurchasableEventById(payload.eventId);

  if (!event) {
    throw new AppError(404, "Event not found or not purchasable");
  }

  const ticketType = event.ticketTypes.find(
    (item) => item.id === payload.ticketTypeId,
  );

  if (!ticketType) {
    throw new AppError(404, "Ticket type not found");
  }

  if (ticketType.isSoldOut || ticketType.quota < 1) {
    throw new AppError(409, "Ticket type is sold out");
  }

  const existingTransaction = await findUserTransactionByEvent(userId, event.id);

  if (existingTransaction) {
    throw new AppError(
      409,
      "You already have an active or completed transaction for this event",
    );
  }

  const voucher = payload.voucherCode
    ? await findAvailableVoucherByCode(event.id, payload.voucherCode, now)
    : null;

  if (payload.voucherCode && !voucher) {
    throw new AppError(400, "Voucher is invalid");
  }

  const coupon = payload.couponCode
    ? await findAvailableCouponByCode(userId, payload.couponCode, now)
    : null;

  if (payload.couponCode && !coupon) {
    throw new AppError(400, "Coupon is invalid");
  }

  const totalAmount = ticketType.price;
  const voucherAmount = voucher?.amount ?? 0;
  const couponAmount = coupon?.amount ?? 0;
  const pointsToUse = payload.pointsToUse ?? 0;

  if (voucherAmount + couponAmount > totalAmount) {
    throw new AppError(
      400,
      "Voucher and coupon amount exceed the ticket price",
    );
  }

  const maxPointsThatCanBeUsed = totalAmount - voucherAmount - couponAmount;

  if (pointsToUse > maxPointsThatCanBeUsed) {
    throw new AppError(400, "Points amount exceeds the payable amount");
  }

  const pointAllocations = await buildPointAllocations(userId, pointsToUse, now);
  const finalAmount = totalAmount - voucherAmount - couponAmount - pointsToUse;
  const expiredAt = new Date(Date.now() + TWO_HOURS_IN_MS);
  const paymentRequired = finalAmount > 0;
  const nextStatus: TransactionStatus = paymentRequired
    ? "WAITING_FOR_PAYMENT"
    : "DONE";

  const transaction = await prisma.$transaction(
    async (tx) => {
      const checkDuplicate = await findUserTransactionByEvent(userId, event.id, tx);

      if (checkDuplicate) {
        throw new AppError(
          409,
          "You already have an active or completed transaction for this event",
        );
      }

      const reserveTicket = await tx.ticketType.updateMany({
        where: {
          id: ticketType.id,
          eventId: event.id,
          isActive: true,
          isDeleted: false,
          quota: {
            gte: 1,
          },
        },
        data: {
          quota: {
            decrement: 1,
          },
        },
      });

      if (reserveTicket.count === 0) {
        throw new AppError(409, "Ticket type is sold out");
      }

      const reservedTicketType = await tx.ticketType.findUnique({
        where: {
          id: ticketType.id,
        },
      });

      if (reservedTicketType && reservedTicketType.quota === 0 && !reservedTicketType.isSoldOut) {
        await tx.ticketType.update({
          where: {
            id: reservedTicketType.id,
          },
          data: {
            isSoldOut: true,
          },
        });
      }

      if (voucher) {
        const reserveVoucher = await tx.voucher.updateMany({
          where: {
            id: voucher.id,
            quota: {
              gte: 1,
            },
          },
          data: {
            quota: {
              decrement: 1,
            },
          },
        });

        if (reserveVoucher.count === 0) {
          throw new AppError(409, "Voucher is no longer available");
        }
      }

      if (coupon) {
        const reserveCoupon = await tx.coupon.updateMany({
          where: {
            id: coupon.id,
            usedAt: null,
          },
          data: {
            usedAt: now,
          },
        });

        if (reserveCoupon.count === 0) {
          throw new AppError(409, "Coupon is no longer available");
        }
      }

      const createdTransaction = await createTransactionWithItem(
        {
          userId,
          eventId: event.id,
          couponId: coupon?.id ?? null,
          voucherId: voucher?.id ?? null,
          status: nextStatus,
          totalAmount,
          couponAmount,
          voucherAmount,
          pointsAmount: pointsToUse,
          finalAmount,
          expiredAt: paymentRequired ? expiredAt : null,
          transactionItems: {
            create: [
              {
                ticketTypeId: ticketType.id,
                quantity: 1,
                price: ticketType.price,
                subtotal: ticketType.price,
              },
            ],
          },
        },
        tx,
      );

      for (const allocation of pointAllocations) {
        await tx.point.update({
          where: {
            id: allocation.pointId,
          },
          data: {
            pointLeft: {
              decrement: allocation.amount,
            },
            pointUsed: {
              increment: allocation.amount,
            },
          },
        });

        await tx.pointHistory.create({
          data: {
            pointId: allocation.pointId,
            userId: allocation.userId,
            transactionId: createdTransaction.id,
            amount: allocation.amount,
            type: "USED",
            source: "TRANSACTION_USAGE",
          },
        });
      }

      return createdTransaction;
    },
    {
      maxWait: 10_000,
      timeout: 120_000,
    },
  );

  try {
    await sendTransactionEmail({
      email: user.email,
      firstName: user.firstName,
      eventName: event.name,
      venue: event.venue,
      startAt: event.startAt,
      expiredAt: transaction.expiredAt,
      totalAmount: transaction.totalAmount,
      couponAmount: transaction.couponAmount,
      voucherAmount: transaction.voucherAmount,
      pointsAmount: transaction.pointsAmount,
      finalAmount: transaction.finalAmount,
      transactionId: transaction.id,
      paymentRequired,
    });
  } catch (error) {
    console.error("Failed to send transaction email:", error);
  }

  return transaction;
};

export const getMyTransactionsService = async (
  userId: string,
  query: TGetMyTransactionsQuery,
) => {
  await syncExpiredTransactions();

  return findMyTransactions(
    userId,
    query.status
      ? {
          status: query.status,
        }
      : {},
  );
};

export const checkVoucherService = async (query: TCheckVoucherQuery) => {
  await syncExpiredTransactions();

  const voucher = await findAvailableVoucherByCode(
    query.eventId,
    query.code,
    new Date(),
  );

  if (!voucher) {
    throw new AppError(404, "Voucher is invalid");
  }

  return voucher;
};

export const checkCouponService = async (
  userId: string,
  query: TCheckCouponQuery,
) => {
  await syncExpiredTransactions();
  await ensureCouponCodesForUser(userId);

  const coupon = await findAvailableCouponByCode(userId, query.code, new Date());

  if (!coupon) {
    throw new AppError(404, "Coupon is invalid");
  }

  return coupon;
};

export const getMyCouponsService = async (userId: string) => {
  await syncExpiredTransactions();
  await ensureCouponCodesForUser(userId);

  return findAvailableCouponsByUser(userId, new Date());
};
