-- CreateTable
CREATE TABLE "_TravelUserAllergens" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_TravelUserAllergens_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_TravelUserAllergens_B_index" ON "_TravelUserAllergens"("B");

-- AddForeignKey
ALTER TABLE "_TravelUserAllergens" ADD CONSTRAINT "_TravelUserAllergens_A_fkey" FOREIGN KEY ("A") REFERENCES "TravelTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TravelUserAllergens" ADD CONSTRAINT "_TravelUserAllergens_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
