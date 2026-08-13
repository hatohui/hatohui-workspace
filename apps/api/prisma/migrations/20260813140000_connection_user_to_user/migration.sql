-- Connection: "user knows a directory entry" -> mutual user<->user request graph.
-- In-place conversion. Rows whose BirthdayDetails has no Association are dropped,
-- since there is no account on the other side to point at.

-- CreateEnum
CREATE TYPE "ConnectionStatus" AS ENUM ('PENDING', 'ACCEPTED');

-- Drop rows that cannot be converted, while the old columns still exist.
DELETE FROM "Connection" c
WHERE NOT EXISTS (
  SELECT 1 FROM "Association" a WHERE a."birthdayDetailsId" = c."birthdayDetailsId"
);

-- AlterTable: new id columns start nullable (no sensible DEFAULT to backfill with).
ALTER TABLE "Connection" ADD COLUMN     "requesterId" TEXT;
ALTER TABLE "Connection" ADD COLUMN     "addresseeId" TEXT;
ALTER TABLE "Connection" ADD COLUMN     "respondedAt" TIMESTAMP(3);
ALTER TABLE "Connection" ADD COLUMN     "status" "ConnectionStatus" NOT NULL DEFAULT 'PENDING';

-- Backfill: requester is the old owner, addressee is the user Associated with
-- the old entry. Association.birthdayDetailsId is UNIQUE, so this join is 1:1
-- and cannot fan out.
UPDATE "Connection" c
SET    "requesterId" = c."userId",
       "addresseeId" = a."userId"
FROM   "Association" a
WHERE  a."birthdayDetailsId" = c."birthdayDetailsId";

-- Every converted row was already a real, mutual "I know this person" link.
UPDATE "Connection"
SET    "status" = 'ACCEPTED',
       "respondedAt" = "createdAt";

-- Self-connections: X had connected to an entry that X later claimed, so
-- requesterId = addresseeId. Meaningless in a user<->user graph.
DELETE FROM "Connection" WHERE "requesterId" = "addresseeId";

-- Reciprocal duplicates: A->B and B->A are two rows but one connection, and the
-- new UNIQUE(requesterId, addresseeId) will NOT catch them (different column
-- order). Canonicalise on the unordered pair and keep the oldest row, tie-broken
-- by id so the result is deterministic. The survivor's requester is whoever
-- recorded it first, which is semantically right.
DELETE FROM "Connection" c
USING "Connection" k
WHERE LEAST(c."requesterId", c."addresseeId")    = LEAST(k."requesterId", k."addresseeId")
  AND GREATEST(c."requesterId", c."addresseeId") = GREATEST(k."requesterId", k."addresseeId")
  AND (k."createdAt", k."id") < (c."createdAt", c."id");

-- AlterTable: every surviving row is backfilled, so the columns can be required.
ALTER TABLE "Connection" ALTER COLUMN "requesterId" SET NOT NULL;
ALTER TABLE "Connection" ALTER COLUMN "addresseeId" SET NOT NULL;

-- DropForeignKey
ALTER TABLE "Connection" DROP CONSTRAINT "Connection_userId_fkey";

-- DropForeignKey
ALTER TABLE "Connection" DROP CONSTRAINT "Connection_birthdayDetailsId_fkey";

-- DropIndex
DROP INDEX "Connection_userId_birthdayDetailsId_key";

-- AlterTable
ALTER TABLE "Connection" DROP COLUMN "userId";
ALTER TABLE "Connection" DROP COLUMN "birthdayDetailsId";

-- CreateIndex
CREATE UNIQUE INDEX "Connection_requesterId_addresseeId_key" ON "Connection"("requesterId", "addresseeId");

-- CreateIndex
CREATE INDEX "Connection_addresseeId_status_idx" ON "Connection"("addresseeId", "status");

-- AddForeignKey
ALTER TABLE "Connection" ADD CONSTRAINT "Connection_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Connection" ADD CONSTRAINT "Connection_addresseeId_fkey" FOREIGN KEY ("addresseeId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
