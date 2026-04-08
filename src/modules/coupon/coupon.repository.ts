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
