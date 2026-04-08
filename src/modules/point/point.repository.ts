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
