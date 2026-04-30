import type { Prisma } from "../../../generated/prisma/client.js";
import { UserRole } from "../../../generated/prisma/enums.js";
import { AppError } from "../../class/appError.js";
import { findEventById } from "../event/event.repository.js";
import {
  countTickets,
  findTicketByCodeForCheckIn,
  findManyTickets,
  markTicketCheckedInById,
} from "./ticket.repository.js";
import type {
  TCheckInTicketBody,
  TGetTicketAttendanceStatsQuery,
  TGetTicketsQuery,
} from "./ticket.schemas.js";

const buildStringFilter = (exact?: string, like?: string) => {
  if (!exact && !like) return undefined;

  return {
    ...(exact
      ? {
          equals: exact,
        }
      : {}),
    ...(like
      ? {
          contains: like,
        }
      : {}),
    mode: "insensitive" as const,
  };
};

export const checkInTicketService = async (
  actorId: string,
  actorRole: UserRole,
  payload: TCheckInTicketBody,
) => {
  const ticket = await findTicketByCodeForCheckIn(payload.code);

  if (!ticket) {
    throw new AppError(404, "Ticket not found");
  }

  if (ticket.transaction.status !== "DONE") {
    throw new AppError(409, "Ticket is not valid for check-in");
  }

  if (
    actorRole !== UserRole.ADMIN &&
    ticket.transaction.event.organizerId !== actorId
  ) {
    throw new AppError(403, "You are not allowed to verify this ticket");
  }

  if (ticket.checkedInAt) {
    throw new AppError(409, "Ticket has already been checked in");
  }

  const checkedInAt = new Date();
  const markCheckedIn = await markTicketCheckedInById(ticket.id, checkedInAt);

  if (markCheckedIn.count === 0) {
    throw new AppError(409, "Ticket has already been checked in");
  }

  return {
    id: ticket.id,
    code: ticket.code,
    checkedInAt,
    user: {
      id: ticket.user.id,
      firstName: ticket.user.firstName,
      lastName: ticket.user.lastName,
      email: ticket.user.email,
    },
    event: {
      id: ticket.transaction.event.id,
      name: ticket.transaction.event.name,
      venue: ticket.transaction.event.venue,
      startAt: ticket.transaction.event.startAt,
    },
    ticketType: {
      id: ticket.transactionItem.ticketType.id,
      name: ticket.transactionItem.ticketType.name,
    },
  };
};

export const getTicketsService = async (
  actorId: string,
  actorRole: UserRole,
  query: TGetTicketsQuery,
) => {
  const codeFilter = buildStringFilter(query.code, query.codeLike);
  const eventNameFilter = buildStringFilter(undefined, query.eventNameLike);
  const ticketTypeNameFilter = buildStringFilter(
    undefined,
    query.ticketTypeNameLike,
  );
  const sortBy = query.sortBy ?? "createdAt";
  const sortOrder = query.sortOrder ?? "desc";
  const page = query.page;
  const limit = query.limit;
  const skip = (page - 1) * limit;

  const transactionWhere: Prisma.TransactionWhereInput = {
    ...(query.transactionId ? { id: query.transactionId } : {}),
    ...(query.eventId ? { eventId: query.eventId } : {}),
    ...(actorRole === UserRole.ADMIN
      ? query.organizerId
        ? {
            event: {
              organizerId: query.organizerId,
            },
          }
        : {}
      : actorRole === UserRole.ORGANIZER
        ? {
            event: {
              organizerId: actorId,
            },
          }
        : {}),
  };

  const eventWhere: Prisma.EventWhereInput = {
    ...(eventNameFilter
      ? {
          name: eventNameFilter,
        }
      : {}),
    ...(actorRole === UserRole.ADMIN
      ? query.organizerId
        ? {
            organizerId: query.organizerId,
          }
        : {}
      : actorRole === UserRole.ORGANIZER
        ? {
            organizerId: actorId,
          }
        : {}),
  };

  const transactionItemWhere: Prisma.TransactionItemWhereInput = {
    ...(query.transactionItemId ? { id: query.transactionItemId } : {}),
    ...(ticketTypeNameFilter
      ? {
          ticketType: {
            name: ticketTypeNameFilter,
          },
        }
      : {}),
  };

  const where: Prisma.TicketWhereInput = {
    ...(query.id ? { id: query.id } : {}),
    ...(actorRole === UserRole.CUSTOMER
      ? { userId: actorId }
      : query.userId
        ? { userId: query.userId }
        : {}),
    ...(codeFilter ? { code: codeFilter } : {}),
    ...(query.checkedIn === undefined
      ? {}
      : query.checkedIn
        ? {
            checkedInAt: {
              not: null,
            },
          }
        : {
            checkedInAt: null,
          }),
    transaction: transactionWhere,
    transactionItem: transactionItemWhere,
    ...(eventNameFilter
      ? {
          transaction: {
            ...transactionWhere,
            event: eventWhere,
          },
        }
      : {}),
  };

  const [tickets, total] = await Promise.all([
    findManyTickets(
      where,
      {
        skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
      },
    ),
    countTickets(where),
  ]);

  if (query.id && tickets.length === 0) {
    throw new AppError(404, "Ticket not found");
  }

  return {
    data: tickets,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getTicketAttendanceStatsService = async (
  actorId: string,
  actorRole: UserRole,
  query: TGetTicketAttendanceStatsQuery,
) => {
  const event = await findEventById(query.eventId);

  if (!event) {
    throw new AppError(404, "Event not found");
  }

  if (actorRole !== UserRole.ADMIN && event.organizerId !== actorId) {
    throw new AppError(
      403,
      "You are not allowed to view ticket statistics for this event",
    );
  }

  const baseWhere: Prisma.TicketWhereInput = {
    transaction: {
      eventId: query.eventId,
    },
  };

  const [totalTickets, totalCheckedInTickets] = await Promise.all([
    countTickets(baseWhere),
    countTickets({
      ...baseWhere,
      checkedInAt: {
        not: null,
      },
    }),
  ]);

  const totalNotCheckedInTickets = totalTickets - totalCheckedInTickets;
  const attendancePercentage =
    totalTickets === 0
      ? 0
      : Number(((totalCheckedInTickets / totalTickets) * 100).toFixed(2));

  return {
    event: {
      id: event.id,
      name: event.name,
      venue: event.venue,
      startAt: event.startAt,
    },
    totalTickets,
    totalCheckedInTickets,
    totalNotCheckedInTickets,
    attendancePercentage,
  };
};
