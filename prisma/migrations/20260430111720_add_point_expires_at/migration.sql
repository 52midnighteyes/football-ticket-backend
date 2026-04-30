-- AlterTable
ALTER TABLE "points" ADD COLUMN "expires_at" TIMESTAMP(3);

-- Backfill existing points from their earned history when available.
-- Fallback to created_at + 3 months so legacy rows remain usable.
UPDATE "points" AS p
SET "expires_at" = COALESCE(
  (
    SELECT ph."expires_at"
    FROM "point_histories" AS ph
    WHERE ph."point_id" = p."id"
      AND ph."type" = 'EARNED'
      AND ph."expires_at" IS NOT NULL
    ORDER BY ph."created_at" ASC
    LIMIT 1
  ),
  p."created_at" + INTERVAL '3 months'
);

ALTER TABLE "points"
ALTER COLUMN "expires_at" SET NOT NULL;
