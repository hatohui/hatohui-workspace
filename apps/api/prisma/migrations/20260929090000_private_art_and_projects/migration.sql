-- AlterTable
ALTER TABLE "Project" RENAME COLUMN "isHidden" TO "isPrivate";

-- AlterTable
ALTER TABLE "Asset" ADD COLUMN     "isPrivate" BOOLEAN NOT NULL DEFAULT false;
