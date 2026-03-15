/*
  Warnings:

  - You are about to drop the column `published` on the `Blog` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Blog" DROP COLUMN "published",
ADD COLUMN     "is_published" BOOLEAN NOT NULL DEFAULT false;
