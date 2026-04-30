import {
  PointHistoryUncheckedCreateInput,
  PointUncheckedCreateInput,
} from "../../../generated/prisma/models.js";
import { prisma } from "../../libs/prisma/prisma.lib.js";
import type { TPrisma } from "../../libs/prisma/prisma.types.js";

export const createPoint = async (
  data: PointUncheckedCreateInput,
  db: TPrisma = prisma,
) => {
  return await db.point.create({
    data,
  });
};

export const createPointHistory = async (
  data: PointHistoryUncheckedCreateInput,
  db: TPrisma = prisma,
) => {
  return await db.pointHistory.create({
    data,
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
      expiresAt: {
        gte: now,
      },
    },
    orderBy: [{ expiresAt: "asc" }, { createdAt: "asc" }],
  });
};

export const reservePointAmount = async (
  pointId: string,
  amount: number,
  now: Date,
  db: TPrisma = prisma,
) => {
  return db.point.updateMany({
    where: {
      id: pointId,
      pointLeft: {
        gte: amount,
      },
      expiresAt: {
        gte: now,
      },
    },
    data: {
      pointLeft: {
        decrement: amount,
      },
      pointUsed: {
        increment: amount,
      },
    },
  });
};
