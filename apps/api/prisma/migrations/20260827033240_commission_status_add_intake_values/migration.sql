-- AlterEnum
-- Split from the following migration: Postgres cannot use a new enum value
-- in the same transaction that adds it.
ALTER TYPE "CommissionStatus" ADD VALUE 'PENDING';
ALTER TYPE "CommissionStatus" ADD VALUE 'ACCEPTED';
ALTER TYPE "CommissionStatus" ADD VALUE 'DECLINED';
