/*
  Warnings:

  - You are about to drop the column `linkId` on the `MetadataConfig` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[metadataId]` on the table `Link` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "MetadataConfig" DROP CONSTRAINT "MetadataConfig_linkId_fkey";

-- DropIndex
DROP INDEX "MetadataConfig_linkId_key";

-- AlterTable
ALTER TABLE "Link" ADD COLUMN     "metadataId" INTEGER;

-- AlterTable
ALTER TABLE "MetadataConfig" DROP COLUMN "linkId";

-- CreateIndex
CREATE UNIQUE INDEX "Link_metadataId_key" ON "Link"("metadataId");

-- AddForeignKey
ALTER TABLE "Link" ADD CONSTRAINT "Link_metadataId_fkey" FOREIGN KEY ("metadataId") REFERENCES "MetadataConfig"("id") ON DELETE SET NULL ON UPDATE CASCADE;
