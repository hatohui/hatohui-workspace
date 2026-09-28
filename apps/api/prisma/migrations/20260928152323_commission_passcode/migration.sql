-- CreateEnum
CREATE TYPE "PasscodeSource" AS ENUM ('ARTIST', 'CLIENT', 'GENERATED');

-- AlterTable
ALTER TABLE "Commission" ADD COLUMN     "passcodeHash" TEXT,
ADD COLUMN     "passcodeSource" "PasscodeSource",
ADD COLUMN     "passcodeUpdatedAt" TIMESTAMP(3);
