/*
  Warnings:

  - You are about to drop the `referrals` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_point_balances` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "referrals" DROP CONSTRAINT "referrals_referred_user_id_fkey";

-- DropForeignKey
ALTER TABLE "referrals" DROP CONSTRAINT "referrals_referrer_user_id_fkey";

-- DropForeignKey
ALTER TABLE "user_point_balances" DROP CONSTRAINT "user_point_balances_user_id_fkey";

-- AlterTable
ALTER TABLE "categories" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "cities" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "countries" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "coupons" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "events" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "password_reset_tokens" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "point_histories" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "provinces" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "ratings" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "refresh_tokens" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "ticket_types" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "tickets" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "transaction_items" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "transactions" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "referrer_user_id" TEXT,
ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "vouchers" ALTER COLUMN "id" DROP DEFAULT;

-- DropTable
DROP TABLE "referrals";

-- DropTable
DROP TABLE "user_point_balances";
