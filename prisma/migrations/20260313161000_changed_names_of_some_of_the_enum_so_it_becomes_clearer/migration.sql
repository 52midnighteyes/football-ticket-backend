/*
  Warnings:

  - Changed the type of `role` on the `User` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "PostCategory" AS ENUM ('MATCH', 'PLAYER', 'TRANSFER', 'NEWS', 'FANS', 'HISTORY', 'TRAINING', 'EVENT', 'MERCH');

-- AlterTable
ALTER TABLE "User" DROP COLUMN "role",
ADD COLUMN     "role" "UserRole" NOT NULL;

-- DropEnum
DROP TYPE "CategoryEnum";

-- DropEnum
DROP TYPE "RolesEnum";
