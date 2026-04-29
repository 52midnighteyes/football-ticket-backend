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

export const reserveTicketType = async (
  ticketTypeId: string,
  eventId: string,
  db: TPrisma = prisma,
) => {
  return db.ticketType.updateMany({
    where: {
      id: ticketTypeId,
      eventId,
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
};

export const releaseTicketType = async (
  ticketTypeId: string,
  quantity: number,
  db: TPrisma = prisma,
) => {
  return db.ticketType.update({
    where: {
      id: ticketTypeId,
    },
    data: {
      quota: {
        increment: quantity,
      },
      isSoldOut: false,
    },
  });
};

export const findTicketTypeById = async (
  ticketTypeId: string,
  db: TPrisma = prisma,
) => {
  return db.ticketType.findUnique({
    where: {
      id: ticketTypeId,
    },
  });
};

export const markTicketTypeSoldOut = async (
  ticketTypeId: string,
  db: TPrisma = prisma,
) => {
  return db.ticketType.update({
    where: {
      id: ticketTypeId,
    },
    data: {
      isSoldOut: true,
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

export const claimExpiredTransactionById = async (
  transactionId: string,
  now: Date,
  db: TPrisma = prisma,
) => {
  return db.transaction.updateMany({
    where: {
      id: transactionId,
      status: "WAITING_FOR_PAYMENT",
      expiredAt: {
        lt: now,
      },
    },
    data: {
      status: "EXPIRED",
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
