-- CreateTable
CREATE TABLE "TravelFoodCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TravelFoodCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TravelPlaceCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TravelPlaceCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_TravelDishToTravelFoodCategory" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_TravelDishToTravelFoodCategory_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_TravelPlaceToTravelPlaceCategory" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_TravelPlaceToTravelPlaceCategory_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "TravelFoodCategory_name_key" ON "TravelFoodCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "TravelPlaceCategory_name_key" ON "TravelPlaceCategory"("name");

-- CreateIndex
CREATE INDEX "_TravelDishToTravelFoodCategory_B_index" ON "_TravelDishToTravelFoodCategory"("B");

-- CreateIndex
CREATE INDEX "_TravelPlaceToTravelPlaceCategory_B_index" ON "_TravelPlaceToTravelPlaceCategory"("B");

-- AddForeignKey
ALTER TABLE "TravelFoodCategory" ADD CONSTRAINT "TravelFoodCategory_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TravelPlaceCategory" ADD CONSTRAINT "TravelPlaceCategory_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TravelDishToTravelFoodCategory" ADD CONSTRAINT "_TravelDishToTravelFoodCategory_A_fkey" FOREIGN KEY ("A") REFERENCES "TravelDish"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TravelDishToTravelFoodCategory" ADD CONSTRAINT "_TravelDishToTravelFoodCategory_B_fkey" FOREIGN KEY ("B") REFERENCES "TravelFoodCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TravelPlaceToTravelPlaceCategory" ADD CONSTRAINT "_TravelPlaceToTravelPlaceCategory_A_fkey" FOREIGN KEY ("A") REFERENCES "TravelPlace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TravelPlaceToTravelPlaceCategory" ADD CONSTRAINT "_TravelPlaceToTravelPlaceCategory_B_fkey" FOREIGN KEY ("B") REFERENCES "TravelPlaceCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
