import { Prisma } from "../../../generated/prisma/client.js";
import type { TransactionStatus } from "../../../generated/prisma/enums.js";
import { prisma } from "../../libs/prisma/prisma.lib.js";
import type { TPrisma } from "../../libs/prisma/prisma.types.js";

const transactionDetailInclude = {
  user: true,
  event: true,
  coupon: true,
  voucher: true,
  tickets: true,
  pointHistories: {
    where: {
      type: "USED",
      source: "TRANSACTION_USAGE",
    },
  },
  transactionItems: {
    include: {
      ticketType: true,
    },
  },
} satisfies Prisma.TransactionInclude;

export const findPurchasableEventById = async (
  eventId: string,
  now: Date,
  db: TPrisma = prisma,
) => {
  return db.event.findFirst({
    where: {
      id: eventId,
      deletedAt: null,
      status: "PUBLISHED",
      startAt: {
        gt: now,
      },
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
    include: transactionDetailInclude,
  });
};

export const findTransactionByIdForUser = async (
  transactionId: string,
  userId: string,
  db: TPrisma = prisma,
) => {
  return db.transaction.findFirst({
    where: {
      id: transactionId,
      userId,
    },
    include: transactionDetailInclude,
  });
};

export const findTransactionByIdForReview = async (
  transactionId: string,
  db: TPrisma = prisma,
) => {
  return db.transaction.findUnique({
    where: {
      id: transactionId,
    },
    include: transactionDetailInclude,
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

export const updateTransactionPaymentProofIfUploadable = async (
  transactionId: string,
  data: Prisma.TransactionUncheckedUpdateInput,
  db: TPrisma = prisma,
) => {
  return db.transaction.updateMany({
    where: {
      id: transactionId,
      status: "WAITING_FOR_PAYMENT",
    },
    data,
  });
};

export const updateTransactionStatusFromCurrent = async (
  transactionId: string,
  currentStatus: TransactionStatus,
  nextStatus: TransactionStatus,
  adminActionAt: Date,
  rejectedReason: string | null,
  db: TPrisma = prisma,
) => {
  return db.transaction.updateMany({
    where: {
      id: transactionId,
      status: currentStatus,
    },
    data: {
      status: nextStatus,
      adminActionAt,
      rejectedReason,
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
      tickets: true,
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

export const findOrganizerTransactions = async (
  where: Prisma.TransactionWhereInput = {},
  options: {
    skip?: number;
    take?: number;
    orderBy?: Prisma.TransactionOrderByWithRelationInput;
  } = {},
  db: TPrisma = prisma,
) => {
  return db.transaction.findMany({
    where,
    include: {
      user: true,
      event: true,
      coupon: true,
      voucher: true,
      tickets: true,
      transactionItems: {
        include: {
          ticketType: true,
        },
      },
      pointHistories: true,
    },
    orderBy: options.orderBy ?? {
      createdAt: "desc",
    },
    skip: options.skip,
    take: options.take,
  });
};

export const countOrganizerTransactions = async (
  where: Prisma.TransactionWhereInput = {},
  db: TPrisma = prisma,
) => {
  return db.transaction.count({
    where,
  });
};

type RevenueGroupBy = "year" | "month" | "day";

type OrganizerRevenueRow = {
  period: string;
  revenue: bigint | number;
};

export const findOrganizerRevenueAnalytics = async (
  params: {
    groupBy: RevenueGroupBy;
    organizerId?: string;
    year?: number;
    month?: number;
  },
  db: TPrisma = prisma,
) => {
  const bucketExpression =
    params.groupBy === "year"
      ? Prisma.sql`date_trunc('year', COALESCE(t.admin_action_at, t.created_at))`
      : params.groupBy === "month"
        ? Prisma.sql`date_trunc('month', COALESCE(t.admin_action_at, t.created_at))`
        : Prisma.sql`date_trunc('day', COALESCE(t.admin_action_at, t.created_at))`;

  const periodFormat =
    params.groupBy === "year"
      ? Prisma.sql`'YYYY'`
      : params.groupBy === "month"
        ? Prisma.sql`'YYYY-MM'`
        : Prisma.sql`'YYYY-MM-DD'`;

  const filters = [
    Prisma.sql`t.status = 'DONE'`,
    ...(params.organizerId
      ? [Prisma.sql`e.organizer_id = ${params.organizerId}`]
      : []),
    ...(params.year
      ? [
          Prisma.sql`EXTRACT(YEAR FROM COALESCE(t.admin_action_at, t.created_at)) = ${params.year}`,
        ]
      : []),
    ...(params.month
      ? [
          Prisma.sql`EXTRACT(MONTH FROM COALESCE(t.admin_action_at, t.created_at)) = ${params.month}`,
        ]
      : []),
  ];

  const whereSql =
    filters.length > 0
      ? Prisma.sql`WHERE ${Prisma.join(filters, " AND ")}`
      : Prisma.empty;

  return db.$queryRaw<OrganizerRevenueRow[]>(Prisma.sql`
    SELECT
      TO_CHAR(${bucketExpression}, ${periodFormat}) AS period,
      COALESCE(SUM(t.final_amount), 0)::bigint AS revenue
    FROM transactions t
    INNER JOIN events e ON e.id = t.event_id
    ${whereSql}
    GROUP BY ${bucketExpression}
    ORDER BY ${bucketExpression} ASC
  `);
};
