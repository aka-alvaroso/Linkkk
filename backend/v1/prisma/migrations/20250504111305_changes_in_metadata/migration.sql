/*
  Warnings:

  - You are about to drop the column `metadataId` on the `Link` table. All the data in the column will be lost.
  - You are about to drop the `MetadataConfig` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Link" DROP CONSTRAINT "Link_metadataId_fkey";

-- DropIndex
DROP INDEX "Link_metadataId_key";

-- AlterTable
ALTER TABLE "Link" DROP COLUMN "metadataId",
ADD COLUMN     "metadataDescription" TEXT,
ADD COLUMN     "metadataImage" TEXT,
ADD COLUMN     "metadataTitle" TEXT,
ADD COLUMN     "useCustomMetadata" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "useGeoBlocking" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "useSmartRedirection" BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE "MetadataConfig";
