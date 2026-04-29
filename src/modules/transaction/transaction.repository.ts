import type { Prisma } from "../../../generated/prisma/client.js";
import { prisma } from "../../libs/prisma/prisma.lib.js";
import type { TPrisma } from "../../libs/prisma/prisma.types.js";

export const findPurchasableEventById = async (
  eventId: string,
  db: TPrisma = prisma,
) => {
  return db.event.findFirst({
    where: {
      id: eventId,
      deletedAt: null,
      status: "PUBLISHED",
    },
    include: {
      organizer: true,
      ticketTypes: {
        where: {
          isActive: true,
          isDeleted: false,
        },
      },
    },
  });
};

export const findUserTransactionByEvent = async (
  userId: string,
  eventId: string,
  db: TPrisma = prisma,
) => {
  return db.transaction.findFirst({
    where: {
      userId,
      eventId,
      status: {
        in: [
          "WAITING_FOR_PAYMENT",
          "WAITING_FOR_ADMIN_CONFIRMATION",
          "DONE",
        ],
      },
    },
  });
};

export const findAvailableVoucherByCode = async (
  eventId: string,
  code: string,
  now: Date,
  db: TPrisma = prisma,
) => {
  return db.voucher.findFirst({
    where: {
      eventId,
      code: {
        equals: code,
        mode: "insensitive",
      },
      deletedAt: null,
      quota: {
        gt: 0,
      },
      startAt: {
        lte: now,
      },
      endAt: {
        gte: now,
      },
    },
  });
};

export const findAvailableCouponByCode = async (
  userId: string,
  code: string,
  now: Date,
  db: TPrisma = prisma,
) => {
  return db.coupon.findFirst({
    where: {
      userId,
      code: {
        equals: code,
        mode: "insensitive",
      },
      usedAt: null,
      expiresAt: {
        gte: now,
      },
    },
  });
};

export const findAvailableCouponsByUser = async (
  userId: string,
  now: Date,
  db: TPrisma = prisma,
) => {
  return db.coupon.findMany({
    where: {
      userId,
      usedAt: null,
      expiresAt: {
        gte: now,
      },
    },
    orderBy: [{ expiresAt: "asc" }, { createdAt: "asc" }],
  });
};

export const findAvailablePointsByUser = async (
  userId: string,
  now: Date,
  db: TPrisma = prisma,
) => {
  return db.point.findMany({
    where: {
      userId,
      pointLeft: {
        gt: 0,
      },
      pointHistories: {
        some: {
          type: "EARNED",
          expiresAt: {
            gte: now,
          },
        },
      },
    },
    include: {
      pointHistories: {
        where: {
          type: "EARNED",
        },
        orderBy: [{ createdAt: "asc" }],
      },
    },
    orderBy: [{ createdAt: "asc" }],
  });
};

export const findExpiredPendingTransactions = async (
  now: Date,
  db: TPrisma = prisma,
) => {
  return db.transaction.findMany({
    where: {
      status: "WAITING_FOR_PAYMENT",
      expiredAt: {
        lt: now,
      },
    },
    include: {
      coupon: true,
      voucher: true,
      pointHistories: {
        where: {
          type: "USED",
          source: "TRANSACTION_USAGE",
        },
      },
      transactionItems: true,
    },
  });
};

export const createTransactionWithItem = async (
  data: Prisma.TransactionUncheckedCreateInput & {
    transactionItems: Prisma.TransactionItemUncheckedCreateNestedManyWithoutTransactionInput;
  },
  db: TPrisma = prisma,
) => {
  return db.transaction.create({
    data,
    include: {
      event: true,
      coupon: true,
      voucher: true,
      transactionItems: {
        include: {
          ticketType: true,
        },
      },
    },
  });
};

export const findMyTransactions = async (
  userId: string,
  where: Prisma.TransactionWhereInput = {},
  db: TPrisma = prisma,
) => {
  return db.transaction.findMany({
    where: {
      userId,
      ...where,
    },
    include: {
      event: true,
      coupon: true,
      voucher: true,
      transactionItems: {
        include: {
          ticketType: true,
        },
      },
      pointHistories: true,
    },
    orderBy: [{ createdAt: "desc" }],
  });
};
