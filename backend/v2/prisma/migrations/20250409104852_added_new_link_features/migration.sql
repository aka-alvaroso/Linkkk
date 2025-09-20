-- AlterTable
ALTER TABLE "Link" ADD COLUMN     "desktopUrl" TEXT,
ADD COLUMN     "mobileUrl" TEXT,
ADD COLUMN     "sufix" TEXT;

-- CreateTable
CREATE TABLE "Country" (
    "id" SERIAL NOT NULL,
    "code" VARCHAR(2) NOT NULL,
    "name" VARCHAR(100) NOT NULL,

    CONSTRAINT "Country_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MetadataConfig" (
    "id" SERIAL NOT NULL,
    "linkId" INTEGER NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "imageUrl" TEXT,
    "siteName" TEXT,
    "twitterCard" TEXT,
    "twitterSite" TEXT,
    "twitterCreator" TEXT,
    "ogType" TEXT,

    CONSTRAINT "MetadataConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_LinkCountries" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_LinkCountries_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "MetadataConfig_linkId_key" ON "MetadataConfig"("linkId");

-- CreateIndex
CREATE INDEX "_LinkCountries_B_index" ON "_LinkCountries"("B");

-- AddForeignKey
ALTER TABLE "MetadataConfig" ADD CONSTRAINT "MetadataConfig_linkId_fkey" FOREIGN KEY ("linkId") REFERENCES "Link"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LinkCountries" ADD CONSTRAINT "_LinkCountries_A_fkey" FOREIGN KEY ("A") REFERENCES "Country"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LinkCountries" ADD CONSTRAINT "_LinkCountries_B_fkey" FOREIGN KEY ("B") REFERENCES "Link"("id") ON DELETE CASCADE ON UPDATE CASCADE;
