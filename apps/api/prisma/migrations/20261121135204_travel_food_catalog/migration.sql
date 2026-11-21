-- CreateTable
CREATE TABLE "TravelDish" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "cuisine" TEXT,
    "description" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TravelDish_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TravelPlace" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "city" TEXT,
    "mapsUrl" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "note" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TravelPlace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TravelRecommendation" (
    "id" TEXT NOT NULL,
    "dishId" TEXT NOT NULL,
    "placeId" TEXT NOT NULL,
    "note" TEXT,
    "estimate" INTEGER,
    "currency" TEXT NOT NULL DEFAULT 'VND',
    "spicy" BOOLEAN NOT NULL DEFAULT false,
    "vegetarian" BOOLEAN NOT NULL DEFAULT false,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TravelRecommendation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TravelRecommendationImage" (
    "id" TEXT NOT NULL,
    "recommendationId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TravelRecommendationImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TravelDish_name_key" ON "TravelDish"("name");

-- CreateIndex
CREATE INDEX "TravelDish_cuisine_idx" ON "TravelDish"("cuisine");

-- CreateIndex
CREATE INDEX "TravelPlace_city_idx" ON "TravelPlace"("city");

-- CreateIndex
CREATE INDEX "TravelRecommendation_dishId_idx" ON "TravelRecommendation"("dishId");

-- CreateIndex
CREATE UNIQUE INDEX "TravelRecommendation_placeId_dishId_key" ON "TravelRecommendation"("placeId", "dishId");

-- CreateIndex
CREATE INDEX "TravelRecommendationImage_recommendationId_position_idx" ON "TravelRecommendationImage"("recommendationId", "position");

-- AddForeignKey
ALTER TABLE "TravelDish" ADD CONSTRAINT "TravelDish_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TravelPlace" ADD CONSTRAINT "TravelPlace_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TravelRecommendation" ADD CONSTRAINT "TravelRecommendation_dishId_fkey" FOREIGN KEY ("dishId") REFERENCES "TravelDish"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TravelRecommendation" ADD CONSTRAINT "TravelRecommendation_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "TravelPlace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TravelRecommendation" ADD CONSTRAINT "TravelRecommendation_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TravelRecommendationImage" ADD CONSTRAINT "TravelRecommendationImage_recommendationId_fkey" FOREIGN KEY ("recommendationId") REFERENCES "TravelRecommendation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TravelRecommendationImage" ADD CONSTRAINT "TravelRecommendationImage_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
