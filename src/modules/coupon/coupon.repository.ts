import { CouponUncheckedCreateInput } from "../../../generated/prisma/models.js";
import { prisma } from "../../libs/prisma/prisma.lib.js";
import type { TPrisma } from "../../libs/prisma/prisma.types.js";

export const createCoupon = async (
  data: CouponUncheckedCreateInput,
  db: TPrisma = prisma,
) => {
  return await db.coupon.create({
    data,
  });
};

export const findAvailableCouponById = async (
  userId: string,
  couponId: string,
  now: Date,
  db: TPrisma = prisma,
) => {
  return db.coupon.findFirst({
    where: {
      id: couponId,
      userId,
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

export const reserveCouponById = async (
  couponId: string,
  usedAt: Date,
  db: TPrisma = prisma,
) => {
  return db.coupon.updateMany({
    where: {
      id: couponId,
      usedAt: null,
    },
    data: {
      usedAt,
    },
  });
};

export const releaseCouponById = async (
  couponId: string,
  db: TPrisma = prisma,
) => {
  return db.coupon.update({
    where: {
      id: couponId,
    },
    data: {
      usedAt: null,
    },
  });
};
