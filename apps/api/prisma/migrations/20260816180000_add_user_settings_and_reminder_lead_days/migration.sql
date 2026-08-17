-- DropIndex
DROP INDEX "EmailOutbox_kind_recipientId_subjectId_occursOn_key";

-- AlterTable
ALTER TABLE "EmailOutbox" ADD COLUMN     "leadDays" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "UserSetting" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "scope" "AppScope" NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserSetting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserSetting_userId_scope_idx" ON "UserSetting"("userId", "scope");

-- CreateIndex
CREATE UNIQUE INDEX "UserSetting_userId_type_scope_key" ON "UserSetting"("userId", "type", "scope");

-- CreateIndex
CREATE UNIQUE INDEX "EmailOutbox_kind_recipientId_subjectId_occursOn_leadDays_key" ON "EmailOutbox"("kind", "recipientId", "subjectId", "occursOn", "leadDays");

-- AddForeignKey
ALTER TABLE "UserSetting" ADD CONSTRAINT "UserSetting_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
