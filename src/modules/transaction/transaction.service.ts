import type { Prisma } from "../../../generated/prisma/client.js";
import { UserRole } from "../../../generated/prisma/enums.js";
import { AppError } from "../../class/appError.js";
import {
  deleteFromCloudinary,
  uploadToCloudinary,
} from "../../libs/cloudinary/cloudinary.lib.js";
import { prisma } from "../../libs/prisma/prisma.lib.js";
import { findAvailableCouponsByUser } from "../coupon/coupon.repository.js";
import { findUserById } from "../user/user.repository.js";
import { findAvailableVoucherByCode } from "../voucher/voucher.repository.js";
import {
  assertPaymentProofUploadable,
  assertTransactionReviewable,
  buildPointAllocations,
  calculateTransactionAmounts,
  createTicketsForTransaction,
  createUsedPointHistories,
  deleteCloudinaryAssetByUrl,
  getAdminConfirmationExpiredAt,
  getAvailablePointBalance,
  reserveTransactionResources,
  restoreTransactionResources,
  sendTransactionCreatedEmail,
  sendTransactionPaymentAcceptedEmail,
  sendTransactionPaymentRejectedEmail,
  syncExpiredTransactions,
  validateCouponOwnership,
} from "./transaction.helper.js";
import {
  countOrganizerTransactions,
  createTransactionWithItem,
  findOrganizerTransactions,
  findOrganizerRevenueAnalytics,
  findMyTransactions,
  findPurchasableEventById,
  findTransactionByIdForReview,
  findTransactionByIdForUser,
  findUserTransactionByEvent,
  updateTransactionPaymentProofIfUploadable,
  updateTransactionStatusFromCurrent,
} from "./transaction.repository.js";
import type {
  TCheckVoucherQuery,
  TCreateTransactionBody,
  TGetOrganizerRevenueQuery,
  TGetOrganizerTransactionsQuery,
  TGetMyTransactionsQuery,
  TUpdateTransactionStatusBody,
} from "./transaction.schemas.js";

const buildContainsFilter = (value?: string) => {
  if (!value) return undefined;

  return {
    contains: value,
    mode: "insensitive" as const,
  };
};

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

const toNumber = (value: bigint | number) => Number(value);

const buildRevenueAnalyticsItems = (
  groupBy: TGetOrganizerRevenueQuery["groupBy"],
  rows: Array<{ period: string; revenue: bigint | number }>,
  year?: number,
  month?: number,
) => {
  const revenueMap = new Map(
    rows.map((row) => [row.period, toNumber(row.revenue)]),
  );

  if (groupBy === "month") {
    return MONTH_LABELS.map((label, index) => {
      const period = `${year}-${String(index + 1).padStart(2, "0")}`;

      return {
        label,
        period,
        revenue: revenueMap.get(period) ?? 0,
      };
    });
  }

  if (groupBy === "day") {
    const daysInMonth = new Date(year as number, month as number, 0).getDate();

    return Array.from({ length: daysInMonth }, (_, index) => {
      const day = String(index + 1).padStart(2, "0");
      const period = `${year}-${String(month).padStart(2, "0")}-${day}`;

      return {
        label: day,
        period,
        revenue: revenueMap.get(period) ?? 0,
      };
    });
  }

  return rows.map((row) => ({
    label: row.period,
    period: row.period,
    revenue: toNumber(row.revenue),
  }));
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

  const event = await findPurchasableEventById(payload.eventId, now);

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

export const uploadTransactionPaymentProofService = async (
  userId: string,
  transactionId: string,
  file: Express.Multer.File,
) => {
  await syncExpiredTransactions();

  const transaction = await findTransactionByIdForUser(transactionId, userId);

  if (!transaction) {
    throw new AppError(404, "Transaction not found");
  }

  assertPaymentProofUploadable(transaction.status);

  let isUploaded = false;
  let newPublicId = "";
  let isPersisted = false;

  try {
    const { public_id, secure_url } = await uploadToCloudinary(
      file,
      transaction.id,
      "TRANSACTION_PROOF",
    );

    isUploaded = true;
    newPublicId = public_id;

    const updateProof = await updateTransactionPaymentProofIfUploadable(
      transaction.id,
      {
        paymentProofUrl: secure_url,
        paymentProofUploadedAt: new Date(),
        expiredAt: getAdminConfirmationExpiredAt(new Date()),
        status: "WAITING_FOR_ADMIN_CONFIRMATION",
      },
    );

    if (updateProof.count === 0) {
      throw new AppError(409, "Transaction status has changed");
    }

    isPersisted = true;

    const updatedTransaction = await findTransactionByIdForUser(
      transaction.id,
      userId,
    );

    if (!updatedTransaction) {
      throw new AppError(404, "Transaction not found");
    }

    if (
      transaction.paymentProofUrl &&
      transaction.paymentProofUrl !== updatedTransaction.paymentProofUrl
    ) {
      try {
        await deleteCloudinaryAssetByUrl(transaction.paymentProofUrl);
      } catch (error) {
        console.error("Failed to delete previous payment proof:", error);
      }
    }

    return updatedTransaction;
  } catch (error) {
    if (isUploaded && !isPersisted) {
      await deleteFromCloudinary(newPublicId);
    }

    throw error;
  }
};

export const reviewTransactionService = async (
  actorId: string,
  actorRole: UserRole,
  transactionId: string,
  payload: TUpdateTransactionStatusBody,
) => {
  await syncExpiredTransactions();

  const transaction = await findTransactionByIdForReview(transactionId);

  if (!transaction) {
    throw new AppError(404, "Transaction not found");
  }

  if (transaction.event.organizerId !== actorId && actorRole !== UserRole.ADMIN) {
    throw new AppError(
      403,
      "You are not allowed to update this transaction status",
    );
  }

  assertTransactionReviewable(transaction.status);

  if (payload.status === "REJECTED") {
    const updatedTransaction = await prisma.$transaction(
      async (tx) => {
        const transition = await updateTransactionStatusFromCurrent(
          transaction.id,
          "WAITING_FOR_ADMIN_CONFIRMATION",
          "REJECTED",
          new Date(),
          null,
          tx,
        );

        if (transition.count === 0) {
          throw new AppError(409, "Transaction status has changed");
        }

        await restoreTransactionResources({
          tx,
          transaction,
        });

        const refreshedTransaction = await findTransactionByIdForReview(
          transaction.id,
          tx,
        );

        if (!refreshedTransaction) {
          throw new AppError(404, "Transaction not found");
        }

        return refreshedTransaction;
      },
      {
        maxWait: 10_000,
        timeout: 120_000,
      },
    );

    try {
      await sendTransactionPaymentRejectedEmail({
        email: transaction.user.email,
        firstName: transaction.user.firstName,
        eventName: transaction.event.name,
        venue: transaction.event.venue,
        startAt: transaction.event.startAt,
        totalAmount: transaction.totalAmount,
        couponAmount: transaction.couponAmount,
        voucherAmount: transaction.voucherAmount,
        pointsAmount: transaction.pointsAmount,
        finalAmount: transaction.finalAmount,
      });
    } catch (error) {
      console.error("Failed to send transaction rejected email:", error);
    }

    return updatedTransaction;
  }

  const { updatedTransaction, tickets } = await prisma.$transaction(
    async (tx) => {
      const transition = await updateTransactionStatusFromCurrent(
        transaction.id,
        "WAITING_FOR_ADMIN_CONFIRMATION",
        "DONE",
        new Date(),
        null,
        tx,
      );

      if (transition.count === 0) {
        throw new AppError(409, "Transaction status has changed");
      }

      const createdTickets = await createTicketsForTransaction({
        tx,
        transaction,
      });

      const refreshedTransaction = await findTransactionByIdForReview(
        transaction.id,
        tx,
      );

      if (!refreshedTransaction) {
        throw new AppError(404, "Transaction not found");
      }

      return {
        updatedTransaction: refreshedTransaction,
        tickets: createdTickets,
      };
    },
    {
      maxWait: 10_000,
      timeout: 120_000,
    },
  );

  try {
    await sendTransactionPaymentAcceptedEmail({
      email: transaction.user.email,
      firstName: transaction.user.firstName,
      eventName: transaction.event.name,
      venue: transaction.event.venue,
      startAt: transaction.event.startAt,
      totalAmount: transaction.totalAmount,
      couponAmount: transaction.couponAmount,
      voucherAmount: transaction.voucherAmount,
      pointsAmount: transaction.pointsAmount,
      finalAmount: transaction.finalAmount,
      tickets,
    });
  } catch (error) {
    console.error("Failed to send transaction accepted email:", error);
  }

  return updatedTransaction;
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

export const getOrganizerTransactionsService = async (
  actorId: string,
  actorRole: UserRole,
  query: TGetOrganizerTransactionsQuery,
) => {
  await syncExpiredTransactions();

  const sortBy = query.sortBy ?? "createdAt";
  const sortOrder = query.sortOrder ?? "desc";
  const page = query.page;
  const limit = query.limit;
  const skip = (page - 1) * limit;

  const eventNameFilter = buildContainsFilter(query.eventNameLike);
  const buyerNameFilter = buildContainsFilter(query.buyerNameLike);
  const buyerEmailFilter = buildContainsFilter(query.buyerEmailLike);

  const eventWhere: Prisma.EventWhereInput = {
    ...(actorRole === UserRole.ADMIN
      ? query.organizerId
        ? {
            organizerId: query.organizerId,
          }
        : {}
      : {
          organizerId: actorId,
        }),
    ...(eventNameFilter
      ? {
          name: eventNameFilter,
        }
      : {}),
  };

  const userWhere: Prisma.UserWhereInput = {
    ...(buyerEmailFilter
      ? {
          email: buyerEmailFilter,
        }
      : {}),
    ...(buyerNameFilter
      ? {
          OR: [
            {
              firstName: buyerNameFilter,
            },
            {
              lastName: buyerNameFilter,
            },
          ],
        }
      : {}),
  };

  const where: Prisma.TransactionWhereInput = {
    event: eventWhere,
    ...(query.id ? { id: query.id } : {}),
    ...(query.eventId ? { eventId: query.eventId } : {}),
    ...(query.userId ? { userId: query.userId } : {}),
    ...(query.status ? { status: query.status } : {}),
    ...(buyerEmailFilter || buyerNameFilter
      ? {
          user: userWhere,
        }
      : {}),
  };

  const [transactions, total] = await Promise.all([
    findOrganizerTransactions(
      where,
      {
        skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
      },
    ),
    countOrganizerTransactions(where),
  ]);

  if (query.id && transactions.length === 0) {
    throw new AppError(404, "Transaction not found");
  }

  return {
    data: transactions,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getOrganizerRevenueAnalyticsService = async (
  actorId: string,
  actorRole: UserRole,
  query: TGetOrganizerRevenueQuery,
) => {
  await syncExpiredTransactions();

  const organizerId =
    actorRole === UserRole.ADMIN ? query.organizerId : actorId;

  const rows = await findOrganizerRevenueAnalytics({
    groupBy: query.groupBy,
    organizerId,
    year: query.year,
    month: query.month,
  });

  const items = buildRevenueAnalyticsItems(
    query.groupBy,
    rows,
    query.year,
    query.month,
  );

  return {
    groupBy: query.groupBy,
    year: query.year ?? null,
    month: query.month ?? null,
    totalRevenue: items.reduce((sum, item) => sum + item.revenue, 0),
    items,
  };
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
