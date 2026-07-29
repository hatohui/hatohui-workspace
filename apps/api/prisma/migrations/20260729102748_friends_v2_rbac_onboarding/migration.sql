/*
  Warnings:

  - You are about to drop the `Friend` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'MEMBER');

-- CreateEnum
CREATE TYPE "OnboardingStatus" AS ENUM ('PENDING', 'COMPLETED', 'SKIPPED');

-- CreateEnum
CREATE TYPE "FriendVisibility" AS ENUM ('PUBLIC', 'FRIENDS_ONLY', 'NONE');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "onboardingStatus" "OnboardingStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'MEMBER';

-- DropTable
DROP TABLE "Friend";

-- CreateTable
CREATE TABLE "AppConfig" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "adminEmail" TEXT NOT NULL,

    CONSTRAINT "AppConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Association" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "birthdayDetailsId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Association_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BirthdayDetails" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "birthYear" INTEGER,
    "birthMonth" INTEGER,
    "birthDay" INTEGER,
    "socialMedias" JSONB,
    "preferAnonymous" BOOLEAN NOT NULL DEFAULT true,
    "visibility" "FriendVisibility" NOT NULL DEFAULT 'PUBLIC',
    "avatarUrl" TEXT,
    "avatarKey" TEXT,
    "gcalEventId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "addedById" TEXT,

    CONSTRAINT "BirthdayDetails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Connection" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "birthdayDetailsId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Connection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Association_userId_key" ON "Association"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Association_birthdayDetailsId_key" ON "Association"("birthdayDetailsId");

-- CreateIndex
CREATE UNIQUE INDEX "Connection_userId_birthdayDetailsId_key" ON "Connection"("userId", "birthdayDetailsId");

-- AddForeignKey
ALTER TABLE "Association" ADD CONSTRAINT "Association_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Association" ADD CONSTRAINT "Association_birthdayDetailsId_fkey" FOREIGN KEY ("birthdayDetailsId") REFERENCES "BirthdayDetails"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BirthdayDetails" ADD CONSTRAINT "BirthdayDetails_addedById_fkey" FOREIGN KEY ("addedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Connection" ADD CONSTRAINT "Connection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Connection" ADD CONSTRAINT "Connection_birthdayDetailsId_fkey" FOREIGN KEY ("birthdayDetailsId") REFERENCES "BirthdayDetails"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
