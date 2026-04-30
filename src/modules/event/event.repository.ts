import type { Prisma } from "../../../generated/prisma/client.js";
import { prisma } from "../../libs/prisma/prisma.lib.js";
import type { TPrisma } from "../../libs/prisma/prisma.types.js";

export const createEvent = async (
  data: Prisma.EventCreateInput,
  db: TPrisma = prisma,
) => {
  return db.event.create({
    data,
    include: {
      ticketTypes: true,
    },
  });
};

export const findManyEvents = async (
  where: Prisma.EventWhereInput = {},
  options: {
    skip?: number;
    take?: number;
    orderBy?: Prisma.EventOrderByWithRelationInput;
  } = {},
  db: TPrisma = prisma,
) => {
  return db.event.findMany({
    where: {
      deletedAt: null,
      ...where,
    },
    orderBy: options.orderBy ?? {
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

export const findEventBySlug = async (
  slug: string,
  db: TPrisma = prisma,
) => {
  return db.event.findFirst({
    where: {
      slug,
      deletedAt: null,
    },
    include: {
      ticketTypes: true,
    },
  });
};

export const updateEvent = async (
  id: string,
  data: Prisma.EventUpdateInput,
  db: TPrisma = prisma,
) => {
  return db.event.update({
    where: { id },
    data,
    include: {
      ticketTypes: true,
    },
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
  data: Prisma.TicketTypeUncheckedCreateInput,
  db: TPrisma = prisma,
) => {
  return db.ticketType.create({
    data,
  });
};

export const updateTicketType = async (
  id: string,
  data: Prisma.TicketTypeUncheckedUpdateInput,
  db: TPrisma = prisma,
) => {
  return db.ticketType.update({
    where: { id },
    data,
  });
};
