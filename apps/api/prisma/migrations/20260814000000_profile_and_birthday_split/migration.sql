-- Splits BirthdayDetails into Profile + Birthday and folds Association into
-- Profile.userId. Rationale and the reason this must RENAME rather than
-- recreate: docs/specs/friends/profile-model/PRD.md

-- BirthdayDetails -> Profile
ALTER TABLE "BirthdayDetails" RENAME TO "Profile";
ALTER TABLE "Profile" RENAME CONSTRAINT "BirthdayDetails_pkey" TO "Profile_pkey";
ALTER TABLE "Profile" RENAME CONSTRAINT "BirthdayDetails_addedById_fkey" TO "Profile_addedById_fkey";
ALTER TABLE "Profile" RENAME COLUMN "name" TO "displayName";

-- Association -> Profile.userId
ALTER TABLE "Profile" ADD COLUMN "userId" TEXT;

UPDATE "Profile" p
SET "userId" = a."userId"
FROM "Association" a
WHERE a."birthdayDetailsId" = p."id";

-- User.handle -> Profile.handle
ALTER TABLE "Profile" ADD COLUMN "handle" TEXT;

UPDATE "Profile" p
SET "handle" = u."handle"
FROM "User" u
WHERE u."id" = p."userId" AND u."handle" IS NOT NULL;

-- Extract Birthday. Ids are uuids here, not cuids: see PRD.
CREATE TABLE "Birthday" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "year" INTEGER,
    "month" INTEGER NOT NULL,
    "day" INTEGER NOT NULL,
    "visibility" "FriendVisibility" NOT NULL DEFAULT 'PUBLIC',
    "gcalEventId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Birthday_pkey" PRIMARY KEY ("id")
);

INSERT INTO "Birthday" ("id", "profileId", "year", "month", "day", "visibility", "gcalEventId", "createdAt", "updatedAt")
SELECT
    gen_random_uuid()::text,
    p."id",
    p."birthYear",
    p."birthMonth",
    p."birthDay",
    p."visibility",
    p."gcalEventId",
    p."createdAt",
    p."updatedAt"
FROM "Profile" p
WHERE p."birthMonth" IS NOT NULL AND p."birthDay" IS NOT NULL;

-- Drop what moved or died
ALTER TABLE "Profile"
    DROP COLUMN "birthYear",
    DROP COLUMN "birthMonth",
    DROP COLUMN "birthDay",
    DROP COLUMN "gcalEventId",
    DROP COLUMN "preferAnonymous",
    DROP COLUMN "visibility";

DROP TABLE "Association";

DROP INDEX "User_handle_key";
ALTER TABLE "User" DROP COLUMN "handle";

-- Indexes and foreign keys last, so the backfills above run unencumbered
CREATE UNIQUE INDEX "Profile_userId_key" ON "Profile"("userId");
CREATE UNIQUE INDEX "Profile_handle_key" ON "Profile"("handle");
CREATE UNIQUE INDEX "Birthday_profileId_key" ON "Birthday"("profileId");
CREATE INDEX "Birthday_month_day_idx" ON "Birthday"("month", "day");

ALTER TABLE "Profile" ADD CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Birthday" ADD CONSTRAINT "Birthday_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
