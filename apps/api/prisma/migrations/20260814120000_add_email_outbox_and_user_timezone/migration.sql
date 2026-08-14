-- AlterTable
ALTER TABLE "User" ADD COLUMN "timezone" TEXT NOT NULL DEFAULT 'UTC';

-- CreateEnum
CREATE TYPE "EmailOutboxKind" AS ENUM ('SELF_BIRTHDAY', 'FRIEND_BIRTHDAY_UPCOMING', 'FRIEND_BIRTHDAY_TODAY');

-- CreateEnum
CREATE TYPE "EmailOutboxStatus" AS ENUM ('PENDING', 'SENDING', 'SENT', 'FAILED');

-- CreateTable
CREATE TABLE "EmailOutbox" (
    "id" TEXT NOT NULL,
    "kind" "EmailOutboxKind" NOT NULL,
    "recipientId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "occursOn" DATE NOT NULL,
    "status" "EmailOutboxStatus" NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "lastError" TEXT,
    "claimedAt" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailOutbox_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EmailOutbox_status_createdAt_idx" ON "EmailOutbox"("status", "createdAt");

-- CreateIndex
CREATE INDEX "EmailOutbox_status_sentAt_idx" ON "EmailOutbox"("status", "sentAt");

-- The constraint the hourly evaluate pass leans on: re-enqueuing an already
-- queued reminder is a no-op rather than a duplicate send.
-- CreateIndex
CREATE UNIQUE INDEX "EmailOutbox_kind_recipientId_subjectId_occursOn_key" ON "EmailOutbox"("kind", "recipientId", "subjectId", "occursOn");

-- AddForeignKey
ALTER TABLE "EmailOutbox" ADD CONSTRAINT "EmailOutbox_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
