-- AlterEnum
ALTER TYPE "ProcessType" ADD VALUE 'NOTIFICATION_EMAIL';

-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "emailedAt" TIMESTAMP(3);
