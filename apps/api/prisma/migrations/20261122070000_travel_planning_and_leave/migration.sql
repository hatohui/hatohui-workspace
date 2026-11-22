-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'TRAVEL_JOIN_REQUEST';
ALTER TYPE "NotificationType" ADD VALUE 'TRAVEL_JOIN_REQUEST_APPROVED';
ALTER TYPE "NotificationType" ADD VALUE 'TRAVEL_JOIN_REQUEST_REJECTED';
ALTER TYPE "NotificationType" ADD VALUE 'TRAVEL_INVITED_TO_JOIN';
ALTER TYPE "NotificationType" ADD VALUE 'TRAVEL_INVITE_ACCEPTED';
ALTER TYPE "NotificationType" ADD VALUE 'TRAVEL_INVITE_DECLINED';
ALTER TYPE "NotificationType" ADD VALUE 'TRAVEL_OWNERSHIP_TRANSFERRED';
ALTER TYPE "NotificationType" ADD VALUE 'TRAVEL_GROUP_PROMOTION';
ALTER TYPE "NotificationType" ADD VALUE 'TRAVEL_USER_KICKED';
ALTER TYPE "NotificationType" ADD VALUE 'TRAVEL_USER_LEFT';
ALTER TYPE "NotificationType" ADD VALUE 'TRAVEL_EVENT_DELETED';
ALTER TYPE "NotificationType" ADD VALUE 'TRAVEL_PLAN_DELETED';

-- AlterEnum
ALTER TYPE "ProcessType" ADD VALUE 'TRAVEL_EVENT_THUMBNAIL';
ALTER TYPE "ProcessType" ADD VALUE 'TRAVEL_GROUP_IMAGE_THUMBNAIL';
ALTER TYPE "ProcessType" ADD VALUE 'TRAVEL_ACTIVITY_IMAGE_THUMBNAIL';
ALTER TYPE "ProcessType" ADD VALUE 'TRAVEL_ACTIVITY_MEDIA_THUMBNAIL';

-- CreateEnum
CREATE TYPE "TravelEventVisibility" AS ENUM ('PUBLIC', 'PRIVATE');

-- CreateEnum
CREATE TYPE "TravelLeaveType" AS ENUM ('ANNUAL', 'SICK', 'UNPAID');

-- CreateEnum
CREATE TYPE "TravelJoinRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "TravelJobProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT,
    "daysOfLeave" INTEGER NOT NULL,
    "daysOfSickLeave" INTEGER NOT NULL,
    "leaveCycleStart" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TravelJobProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TravelWorkSchedule" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sunday" BOOLEAN NOT NULL DEFAULT false,
    "monday" BOOLEAN NOT NULL DEFAULT true,
    "tuesday" BOOLEAN NOT NULL DEFAULT true,
    "wednesday" BOOLEAN NOT NULL DEFAULT true,
    "thursday" BOOLEAN NOT NULL DEFAULT true,
    "friday" BOOLEAN NOT NULL DEFAULT true,
    "saturday" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TravelWorkSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TravelScheduleException" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "isWorkDay" BOOLEAN NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TravelScheduleException_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TravelCustomHoliday" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TravelCustomHoliday_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TravelEvent" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "imageKey" TEXT,
    "thumbnailKey" TEXT,
    "previewKey" TEXT,
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "isYearly" BOOLEAN NOT NULL DEFAULT false,
    "visibility" "TravelEventVisibility" NOT NULL DEFAULT 'PUBLIC',
    "startAt" TIMESTAMP(3) NOT NULL,
    "endAt" TIMESTAMP(3) NOT NULL,
    "location" TEXT,
    "mapsUrl" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "areaId" TEXT,
    "placeId" TEXT,
    "reference" TEXT,
    "createdById" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TravelEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TravelEventInvitee" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TravelEventInvitee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TravelParticipationGroup" (
    "id" TEXT NOT NULL,
    "eventId" TEXT,
    "ownerId" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'My Plan',
    "isMemberInviteAllowed" BOOLEAN NOT NULL DEFAULT true,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "isActivityPublicVisible" BOOLEAN NOT NULL DEFAULT true,
    "isMemberListPublicVisible" BOOLEAN NOT NULL DEFAULT true,
    "isMediaPublicVisible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TravelParticipationGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TravelParticipation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "eventId" TEXT,
    "groupId" TEXT,
    "from" TIMESTAMP(3) NOT NULL,
    "to" TIMESTAMP(3) NOT NULL,
    "leaveType" "TravelLeaveType" NOT NULL,
    "createdById" TEXT,
    "isAlreadyHere" BOOLEAN NOT NULL DEFAULT false,
    "entryFlight" TEXT,
    "exitFlight" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TravelParticipation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TravelJoinRequest" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "TravelJoinRequestStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TravelJoinRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TravelGroupImage" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "thumbnailKey" TEXT,
    "previewKey" TEXT,
    "caption" TEXT,
    "uploadedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TravelGroupImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TravelActivity" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "from" TIMESTAMP(3) NOT NULL,
    "to" TIMESTAMP(3) NOT NULL,
    "placeId" TEXT,
    "location" TEXT,
    "mapsUrl" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "involvedPeople" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isExcludeMode" BOOLEAN NOT NULL DEFAULT false,
    "note" TEXT,
    "imageKey" TEXT,
    "thumbnailKey" TEXT,
    "previewKey" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TravelActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TravelActivityMedia" (
    "id" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "thumbnailKey" TEXT,
    "previewKey" TEXT,
    "caption" TEXT,
    "uploadedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TravelActivityMedia_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TravelJobProfile_userId_key" ON "TravelJobProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "TravelWorkSchedule_userId_key" ON "TravelWorkSchedule"("userId");

-- CreateIndex
CREATE INDEX "TravelScheduleException_userId_date_idx" ON "TravelScheduleException"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "TravelScheduleException_userId_date_key" ON "TravelScheduleException"("userId", "date");

-- CreateIndex
CREATE INDEX "TravelCustomHoliday_userId_date_idx" ON "TravelCustomHoliday"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "TravelCustomHoliday_userId_date_key" ON "TravelCustomHoliday"("userId", "date");

-- CreateIndex
CREATE INDEX "TravelEvent_title_idx" ON "TravelEvent"("title");

-- CreateIndex
CREATE INDEX "TravelEvent_startAt_endAt_idx" ON "TravelEvent"("startAt", "endAt");

-- CreateIndex
CREATE INDEX "TravelEvent_areaId_idx" ON "TravelEvent"("areaId");

-- CreateIndex
CREATE INDEX "TravelEventInvitee_userId_idx" ON "TravelEventInvitee"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "TravelEventInvitee_eventId_userId_key" ON "TravelEventInvitee"("eventId", "userId");

-- CreateIndex
CREATE INDEX "TravelParticipationGroup_eventId_idx" ON "TravelParticipationGroup"("eventId");

-- CreateIndex
CREATE INDEX "TravelParticipationGroup_ownerId_idx" ON "TravelParticipationGroup"("ownerId");

-- CreateIndex
CREATE INDEX "TravelParticipation_userId_from_to_idx" ON "TravelParticipation"("userId", "from", "to");

-- CreateIndex
CREATE INDEX "TravelParticipation_userId_eventId_idx" ON "TravelParticipation"("userId", "eventId");

-- CreateIndex
CREATE INDEX "TravelParticipation_groupId_idx" ON "TravelParticipation"("groupId");

-- CreateIndex
CREATE INDEX "TravelJoinRequest_groupId_status_idx" ON "TravelJoinRequest"("groupId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "TravelJoinRequest_groupId_userId_key" ON "TravelJoinRequest"("groupId", "userId");

-- CreateIndex
CREATE INDEX "TravelGroupImage_groupId_idx" ON "TravelGroupImage"("groupId");

-- CreateIndex
CREATE INDEX "TravelActivity_groupId_idx" ON "TravelActivity"("groupId");

-- CreateIndex
CREATE INDEX "TravelActivity_groupId_from_idx" ON "TravelActivity"("groupId", "from");

-- CreateIndex
CREATE INDEX "TravelActivityMedia_activityId_idx" ON "TravelActivityMedia"("activityId");

-- AddForeignKey
ALTER TABLE "TravelJobProfile" ADD CONSTRAINT "TravelJobProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TravelWorkSchedule" ADD CONSTRAINT "TravelWorkSchedule_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TravelScheduleException" ADD CONSTRAINT "TravelScheduleException_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TravelCustomHoliday" ADD CONSTRAINT "TravelCustomHoliday_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TravelEvent" ADD CONSTRAINT "TravelEvent_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "TravelArea"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TravelEvent" ADD CONSTRAINT "TravelEvent_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "TravelPlace"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TravelEvent" ADD CONSTRAINT "TravelEvent_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TravelEventInvitee" ADD CONSTRAINT "TravelEventInvitee_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "TravelEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TravelEventInvitee" ADD CONSTRAINT "TravelEventInvitee_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TravelParticipationGroup" ADD CONSTRAINT "TravelParticipationGroup_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "TravelEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TravelParticipationGroup" ADD CONSTRAINT "TravelParticipationGroup_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TravelParticipation" ADD CONSTRAINT "TravelParticipation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TravelParticipation" ADD CONSTRAINT "TravelParticipation_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "TravelEvent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TravelParticipation" ADD CONSTRAINT "TravelParticipation_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "TravelParticipationGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TravelParticipation" ADD CONSTRAINT "TravelParticipation_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TravelJoinRequest" ADD CONSTRAINT "TravelJoinRequest_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "TravelParticipationGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TravelJoinRequest" ADD CONSTRAINT "TravelJoinRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TravelGroupImage" ADD CONSTRAINT "TravelGroupImage_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "TravelParticipationGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TravelGroupImage" ADD CONSTRAINT "TravelGroupImage_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TravelActivity" ADD CONSTRAINT "TravelActivity_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "TravelParticipationGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TravelActivity" ADD CONSTRAINT "TravelActivity_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "TravelPlace"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TravelActivity" ADD CONSTRAINT "TravelActivity_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TravelActivityMedia" ADD CONSTRAINT "TravelActivityMedia_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "TravelActivity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TravelActivityMedia" ADD CONSTRAINT "TravelActivityMedia_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
