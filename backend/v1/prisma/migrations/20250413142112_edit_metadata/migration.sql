/*
  Warnings:

  - You are about to drop the column `ogType` on the `MetadataConfig` table. All the data in the column will be lost.
  - You are about to drop the column `siteName` on the `MetadataConfig` table. All the data in the column will be lost.
  - You are about to drop the column `twitterCard` on the `MetadataConfig` table. All the data in the column will be lost.
  - You are about to drop the column `twitterCreator` on the `MetadataConfig` table. All the data in the column will be lost.
  - You are about to drop the column `twitterSite` on the `MetadataConfig` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "MetadataConfig" DROP COLUMN "ogType",
DROP COLUMN "siteName",
DROP COLUMN "twitterCard",
DROP COLUMN "twitterCreator",
DROP COLUMN "twitterSite";
