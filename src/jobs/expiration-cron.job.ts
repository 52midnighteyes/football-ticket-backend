import { prisma } from "../libs/prisma/prisma.lib.js";
import { syncExpiredTransactions } from "../modules/transaction/transaction.helper.js";

const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;

let expirationCronTimeout: NodeJS.Timeout | null = null;
let expirationCronStarted = false;

const getNextMidnight = (now: Date) => {
  const nextMidnight = new Date(now);
  nextMidnight.setHours(24, 0, 0, 0);

  return nextMidnight;
};

const expirePointsAndCoupons = async (now: Date) => {
  const [expiredPoints, expiredCoupons] = await Promise.all([
    prisma.point.findMany({
      where: {
        pointLeft: {
          gt: 0,
        },
        pointHistories: {
          some: {
            type: "EARNED",
            expiresAt: {
              lt: now,
            },
          },
        },
      },
      include: {
        pointHistories: {
          where: {
            type: "EARNED",
            expiresAt: {
              lt: now,
            },
          },
          orderBy: [{ expiresAt: "asc" }, { createdAt: "asc" }],
        },
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
        const earnedHistory = point.pointHistories[0];

        const expirePoint = await tx.point.updateMany({
          where: {
            id: point.id,
            pointLeft: {
              gt: 0,
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
            expiresAt: earnedHistory?.expiresAt ?? now,
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
  await syncExpiredTransactions();
  const pointAndCouponSummary = await expirePointsAndCoupons(now);

  console.log("[cron] expiration sweep completed", {
    ranAt: now.toISOString(),
    ...pointAndCouponSummary,
  });
};

const scheduleNextExpirationSweep = () => {
  const now = new Date();
  const nextMidnight = getNextMidnight(now);
  const delay = Math.max(0, nextMidnight.getTime() - now.getTime());

  expirationCronTimeout = setTimeout(async () => {
    try {
      await runExpirationSweep(new Date());
    } catch (error) {
      console.error("[cron] expiration sweep failed", error);
    } finally {
      scheduleNextExpirationSweep();
    }
  }, delay);

  console.log("[cron] next expiration sweep scheduled", {
    nextRunAt: nextMidnight.toISOString(),
    delayInMs: delay,
    repeatEveryMs: ONE_DAY_IN_MS,
  });
};

export const startExpirationCron = () => {
  if (expirationCronStarted) {
    return;
  }

  expirationCronStarted = true;

  void runExpirationSweep(new Date()).catch((error) => {
    console.error("[cron] initial expiration sweep failed", error);
  });

  scheduleNextExpirationSweep();
};

export const stopExpirationCron = () => {
  if (expirationCronTimeout) {
    clearTimeout(expirationCronTimeout);
    expirationCronTimeout = null;
  }

  expirationCronStarted = false;
};
