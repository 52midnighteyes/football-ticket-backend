-- AlterTable
ALTER TABLE "coupons" ADD COLUMN "code" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "coupons_code_key" ON "coupons"("code");
