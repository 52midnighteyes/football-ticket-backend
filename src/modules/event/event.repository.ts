import type {
  EventUncheckedCreateInput,
  EventUncheckedUpdateInput,
  TicketTypeUncheckedCreateInput,
} from "../../../generated/prisma/models.js";
import type { Prisma } from "../../../generated/prisma/client.js";
import { prisma } from "../../libs/prisma/prisma.lib.js";
import type { TPrisma } from "../../libs/prisma/prisma.types.js";

export const createEvent = async (
  data: EventUncheckedCreateInput,
  db: TPrisma = prisma,
) => {
  return db.event.create({
    data,
  });
};

export const findManyEvents = async (
  where: Prisma.EventWhereInput = {},
  options: { skip?: number; take?: number } = {},
  db: TPrisma = prisma,
) => {
  return db.event.findMany({
    where: {
      deletedAt: null,
      ...where,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      ticketTypes: true,
    },
    skip: options.skip,
    take: options.take,
  });
};

export const countEvents = async (
  where: Prisma.EventWhereInput = {},
  db: TPrisma = prisma,
) => {
  return db.event.count({
    where: {
      deletedAt: null,
      ...where,
    },
  });
};

export const findEventById = async (id: string, db: TPrisma = prisma) => {
  return db.event.findFirst({
    where: {
      id,
      deletedAt: null,
    },
    include: {
      ticketTypes: true,
    },
  });
};

export const updateEvent = async (
  id: string,
  data: EventUncheckedUpdateInput,
  db: TPrisma = prisma,
) => {
  return db.event.update({
    where: { id },
    data,
  });
};

export const deleteEvent = async (id: string, db: TPrisma = prisma) => {
  return db.event.update({
    where: { id },
    data: {
      deletedAt: new Date(),
    },
  });
};

export const createTicketType = async (
  data: TicketTypeUncheckedCreateInput,
  db: TPrisma = prisma,
) => {
  return db.ticketType.create({
    data,
  });
};
