-- AlterTable
ALTER TABLE "Comment" ADD COLUMN     "images" TEXT[] DEFAULT ARRAY[]::TEXT[];
