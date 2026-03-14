/*
  Warnings:

  - You are about to drop the column `name` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[title]` on the table `Post` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `Post` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `excerpt` to the `Post` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `Post` table without a default value. This is not possible if the table is not empty.
  - Added the required column `first_name` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `last_name` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `role` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "RolesEnum" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "CategoryEnum" AS ENUM ('MATCH', 'PLAYER', 'TRANSFER', 'NEWS', 'FANS', 'HISTORY', 'TRAINING', 'EVENT', 'MERCH');

-- CreateEnum
CREATE TYPE "PlayerPosition" AS ENUM ('GOAL_KEEPER', 'DEFENDER', 'MIDFIELDER', 'ATTACKER');

-- CreateEnum
CREATE TYPE "StaffRole" AS ENUM ('MANAGER', 'HEAD_COACH', 'ASSISTANT_COACH', 'GOALKEEPER_COACH', 'FITNESS_COACH', 'PHYSIOTHERAPIST', 'TEAM_DOCTOR', 'ANALYST', 'KIT_MANAGER', 'ADMINISTRATOR');

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "excerpt" TEXT NOT NULL,
ADD COLUMN     "slug" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "name",
ADD COLUMN     "first_name" TEXT NOT NULL,
ADD COLUMN     "last_name" TEXT NOT NULL,
ADD COLUMN     "password" TEXT NOT NULL,
ADD COLUMN     "role" "RolesEnum" NOT NULL;

-- CreateTable
CREATE TABLE "ContactForm" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContactForm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Players" (
    "id" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "jersey_number" INTEGER NOT NULL,
    "nationality" TEXT NOT NULL,
    "position" "PlayerPosition" NOT NULL,
    "avatar" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Players_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Staff" (
    "id" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "nationality" TEXT NOT NULL,
    "staff_role" "StaffRole" NOT NULL,
    "avatar" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Staff_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Players_jersey_number_key" ON "Players"("jersey_number");

-- CreateIndex
CREATE UNIQUE INDEX "Post_title_key" ON "Post"("title");

-- CreateIndex
CREATE UNIQUE INDEX "Post_slug_key" ON "Post"("slug");

-- CreateIndex
CREATE INDEX "Post_id_slug_idx" ON "Post"("id", "slug");

-- CreateIndex
CREATE INDEX "User_id_email_idx" ON "User"("id", "email");
