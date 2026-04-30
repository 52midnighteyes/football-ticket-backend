/*
  Warnings:

  - Added the required column `point_id` to the `point_histories` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "point_histories" ADD COLUMN     "point_id" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "points" (
    "id" TEXT NOT NULL,
    "point_earned" INTEGER NOT NULL,
    "point_used" INTEGER NOT NULL DEFAULT 0,
    "point_left" INTEGER NOT NULL DEFAULT 0,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "points_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "points" ADD CONSTRAINT "points_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "point_histories" ADD CONSTRAINT "point_histories_point_id_fkey" FOREIGN KEY ("point_id") REFERENCES "points"("id") ON DELETE CASCADE ON UPDATE CASCADE;
