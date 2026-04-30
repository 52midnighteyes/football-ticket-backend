import type { TicketUncheckedCreateInput } from "../../../generated/prisma/models.js";
import type { Prisma } from "../../../generated/prisma/client.js";
import { prisma } from "../../libs/prisma/prisma.lib.js";
import type { TPrisma } from "../../libs/prisma/prisma.types.js";

export const createTicket = async (
  data: TicketUncheckedCreateInput,
  db: TPrisma = prisma,
) => {
  return db.ticket.create({
    data,
  });
};

export const findTicketByCodeForCheckIn = async (
  code: string,
  db: TPrisma = prisma,
) => {
  return db.ticket.findFirst({
    where: {
      code: {
        equals: code,
        mode: "insensitive",
      },
    },
    include: {
      user: true,
      transaction: {
        include: {
          event: true,
        },
      },
      transactionItem: {
        include: {
          ticketType: true,
        },
      },
    },
  });
};

export const markTicketCheckedInById = async (
  ticketId: string,
  checkedInAt: Date,
  db: TPrisma = prisma,
) => {
  return db.ticket.updateMany({
    where: {
      id: ticketId,
      checkedInAt: null,
    },
    data: {
      checkedInAt,
    },
  });
};

export const findManyTickets = async (
  where: Prisma.TicketWhereInput = {},
  options: {
    skip?: number;
    take?: number;
    orderBy?: Prisma.TicketOrderByWithRelationInput;
  } = {},
  db: TPrisma = prisma,
) => {
  return db.ticket.findMany({
    where,
    include: {
      user: true,
      transaction: {
        include: {
          event: true,
        },
      },
      transactionItem: {
        include: {
          ticketType: true,
        },
      },
    },
    orderBy: options.orderBy ?? {
      createdAt: "desc",
    },
    skip: options.skip,
    take: options.take,
  });
};

export const countTickets = async (
  where: Prisma.TicketWhereInput = {},
  db: TPrisma = prisma,
) => {
  return db.ticket.count({
    where,
  });
};
