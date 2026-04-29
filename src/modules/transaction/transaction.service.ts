import { AppError } from "../../class/appError.js";
import { prisma } from "../../libs/prisma/prisma.lib.js";
import { findAvailableCouponsByUser } from "../coupon/coupon.repository.js";
import { findAvailableVoucherByCode } from "../voucher/voucher.repository.js";
import { findUserById } from "../user/user.repository.js";
import {
  buildPointAllocations,
  calculateTransactionAmounts,
  createUsedPointHistories,
  getAvailablePointBalance,
  reserveTransactionResources,
  sendTransactionCreatedEmail,
  syncExpiredTransactions,
  validateCouponOwnership,
} from "./transaction.helper.js";
import {
  createTransactionWithItem,
  findMyTransactions,
  findPurchasableEventById,
  findUserTransactionByEvent,
} from "./transaction.repository.js";
import type {
  TCheckVoucherQuery,
  TCreateTransactionBody,
  TGetMyTransactionsQuery,
} from "./transaction.schemas.js";

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

  const coupon = await validateCouponOwnership({
    userId,
    couponId: payload.couponId,
    now,
  });

  const totalAmount = ticketType.price;
  const voucherAmount = voucher?.amount ?? 0;
  const couponAmount = coupon?.amount ?? 0;
  const availablePointBalance = payload.usePoints
    ? await getAvailablePointBalance(userId, now)
    : 0;
  const maxPointsToUse = Math.max(0, totalAmount - voucherAmount - couponAmount);
  const pointsToUse = Math.min(availablePointBalance, maxPointsToUse);
  const pointAllocations = await buildPointAllocations(userId, pointsToUse, now);

  const calculation = calculateTransactionAmounts({
    totalAmount,
    voucherAmount,
    couponAmount,
    pointsToUse,
  });

  const transaction = await prisma.$transaction(
    async (tx) => {
      const duplicateTransaction = await findUserTransactionByEvent(
        userId,
        event.id,
        tx,
      );

      if (duplicateTransaction) {
        throw new AppError(
          409,
          "You already have an active or completed transaction for this event",
        );
      }

      await reserveTransactionResources({
        tx,
        eventId: event.id,
        ticketTypeId: ticketType.id,
        voucherId: voucher?.id,
        couponId: coupon?.id,
        pointAllocations,
        usedAt: now,
      });

      const createdTransaction = await createTransactionWithItem(
        {
          userId,
          eventId: event.id,
          couponId: coupon?.id ?? null,
          voucherId: voucher?.id ?? null,
          status: calculation.status,
          totalAmount,
          couponAmount,
          voucherAmount,
          pointsAmount: pointsToUse,
          finalAmount: calculation.finalAmount,
          expiredAt: calculation.expiredAt,
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

      await createUsedPointHistories({
        tx,
        transactionId: createdTransaction.id,
        pointAllocations,
      });

      return createdTransaction;
    },
    {
      maxWait: 10_000,
      timeout: 120_000,
    },
  );

  try {
    await sendTransactionCreatedEmail({
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
      paymentRequired: calculation.paymentRequired,
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

export const getMyCouponsService = async (userId: string) => {
  await syncExpiredTransactions();
  return findAvailableCouponsByUser(userId, new Date());
};

export const getMyAvailablePointsService = async (userId: string) => {
  await syncExpiredTransactions();

  return {
    totalAvailablePoints: await getAvailablePointBalance(userId, new Date()),
  };
};
