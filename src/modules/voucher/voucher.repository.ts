import { prisma } from "../../libs/prisma/prisma.lib.js";
import type { TPrisma } from "../../libs/prisma/prisma.types.js";

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

export const reserveVoucherById = async (
  voucherId: string,
  db: TPrisma = prisma,
) => {
  return db.voucher.updateMany({
    where: {
      id: voucherId,
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

export const releaseVoucherById = async (
  voucherId: string,
  db: TPrisma = prisma,
) => {
  return db.voucher.update({
    where: {
      id: voucherId,
    },
    data: {
      quota: {
        increment: 1,
      },
    },
  });
};
