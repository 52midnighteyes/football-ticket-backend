-- DropIndex
DROP INDEX IF EXISTS "coupons_code_key";

-- AlterTable
ALTER TABLE "coupons" DROP COLUMN IF EXISTS "code";
