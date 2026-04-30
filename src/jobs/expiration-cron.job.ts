import cron from "node-cron";
import {
  CRON_TIMEZONE,
  RUN_EXPIRATION_SWEEP_ON_STARTUP,
} from "../config/config.js";
import { prisma } from "../libs/prisma/prisma.lib.js";
import { syncExpiredTransactions } from "../modules/transaction/transaction.helper.js";

let expirationCronTask: ReturnType<typeof cron.schedule> | null = null;
let expirationCronStarted = false;
let expirationSweepRunning = false;

const expirePointsAndCoupons = async (now: Date) => {
  const [expiredPoints, expiredCoupons] = await Promise.all([
    prisma.point.findMany({
      where: {
        pointLeft: {
          gt: 0,
        },
        expiresAt: {
          lt: now,
        },
      },
      select: {
        id: true,
        userId: true,
        pointLeft: true,
        expiresAt: true,
      },
    }),
    prisma.coupon.findMany({
      where: {
        usedAt: null,
        expiresAt: {
          lt: now,
        },
      },
      select: {
        id: true,
      },
    }),
  ]);

  if (expiredPoints.length === 0 && expiredCoupons.length === 0) {
    return {
      expiredPointCount: 0,
      revokedCouponCount: 0,
    };
  }

  const summary = await prisma.$transaction(
    async (tx) => {
      let expiredPointCount = 0;

      for (const point of expiredPoints) {
        if (point.pointLeft <= 0) continue;

        const expiredAmount = point.pointLeft;

        const expirePoint = await tx.point.updateMany({
          where: {
            id: point.id,
            pointLeft: {
              gt: 0,
            },
            expiresAt: {
              lt: now,
            },
          },
          data: {
            pointLeft: 0,
            pointUsed: {
              increment: expiredAmount,
            },
          },
        });

        if (expirePoint.count === 0) {
          continue;
        }

        await tx.pointHistory.create({
          data: {
            pointId: point.id,
            userId: point.userId,
            amount: expiredAmount,
            type: "EXPIRED",
            source: "SYSTEM_EXPIRE",
            expiresAt: point.expiresAt,
          },
        });

        expiredPointCount += 1;
      }

      const revokeExpiredCoupons = expiredCoupons.length
        ? await tx.coupon.updateMany({
            where: {
              id: {
                in: expiredCoupons.map((coupon) => coupon.id),
              },
              usedAt: null,
              expiresAt: {
                lt: now,
              },
            },
            data: {
              usedAt: now,
            },
          })
        : { count: 0 };

      return {
        expiredPointCount,
        revokedCouponCount: revokeExpiredCoupons.count,
      };
    },
    {
      maxWait: 10_000,
      timeout: 120_000,
    },
  );

  return summary;
};

export const runExpirationSweep = async (now: Date = new Date()) => {
  if (expirationSweepRunning) {
    console.log("[cron] expiration sweep skipped because another run is active");
    return;
  }

  expirationSweepRunning = true;

  await syncExpiredTransactions();
  try {
    const pointAndCouponSummary = await expirePointsAndCoupons(now);

    console.log("[cron] expiration sweep completed", {
      ranAt: now.toISOString(),
      timezone: CRON_TIMEZONE,
      ...pointAndCouponSummary,
    });
  } finally {
    expirationSweepRunning = false;
  }
};

export const startExpirationCron = () => {
  if (expirationCronStarted) {
    return;
  }

  expirationCronStarted = true;

  if (RUN_EXPIRATION_SWEEP_ON_STARTUP) {
    void runExpirationSweep(new Date()).catch((error) => {
      console.error("[cron] initial expiration sweep failed", error);
    });
  }

  expirationCronTask = cron.schedule(
    "0 0 * * *",
    async () => {
      try {
        await runExpirationSweep(new Date());
      } catch (error) {
        console.error("[cron] expiration sweep failed", error);
      }
    },
    {
      timezone: CRON_TIMEZONE,
    },
  );

  console.log("[cron] expiration sweep scheduled", {
    cron: "0 0 * * *",
    timezone: CRON_TIMEZONE,
    runOnStartup: RUN_EXPIRATION_SWEEP_ON_STARTUP,
  });
};

export const stopExpirationCron = () => {
  if (expirationCronTask) {
    expirationCronTask.stop();
    expirationCronTask.destroy();
    expirationCronTask = null;
  }

  expirationSweepRunning = false;
  expirationCronStarted = false;
};
