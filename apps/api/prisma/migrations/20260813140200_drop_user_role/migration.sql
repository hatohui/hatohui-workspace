-- User.role was a cache of "does this account's email match the configured
-- admin address", computed only at Google login — so it silently went stale
-- whenever that AppConfig value changed. Admin-ness is now derived per request
-- from AppConfig instead, leaving a single source of truth.

-- AlterTable
ALTER TABLE "User" DROP COLUMN "role";

-- DropEnum
DROP TYPE "Role";
