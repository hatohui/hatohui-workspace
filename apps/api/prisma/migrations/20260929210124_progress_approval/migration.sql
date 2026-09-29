-- AlterTable
ALTER TABLE "CommissionProgress" ADD COLUMN     "approvedAt" TIMESTAMP(3),
ADD COLUMN     "requestsApproval" BOOLEAN NOT NULL DEFAULT false;
