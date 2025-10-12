/*
  Warnings:

  - You are about to drop the column `accessLimit` on the `Link` table. All the data in the column will be lost.
  - You are about to drop the column `blockedCountries` on the `Link` table. All the data in the column will be lost.
  - You are about to drop the column `dateExpire` on the `Link` table. All the data in the column will be lost.
  - You are about to drop the column `desktopUrl` on the `Link` table. All the data in the column will be lost.
  - You are about to drop the column `metadataDescription` on the `Link` table. All the data in the column will be lost.
  - You are about to drop the column `metadataImage` on the `Link` table. All the data in the column will be lost.
  - You are about to drop the column `metadataTitle` on the `Link` table. All the data in the column will be lost.
  - You are about to drop the column `mobileUrl` on the `Link` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `Link` table. All the data in the column will be lost.
  - You are about to drop the column `qrBinaryBytes` on the `Link` table. All the data in the column will be lost.
  - You are about to drop the column `sufix` on the `Link` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Link_sufix_key";

-- AlterTable
ALTER TABLE "Link" DROP COLUMN "accessLimit",
DROP COLUMN "blockedCountries",
DROP COLUMN "dateExpire",
DROP COLUMN "desktopUrl",
DROP COLUMN "metadataDescription",
DROP COLUMN "metadataImage",
DROP COLUMN "metadataTitle",
DROP COLUMN "mobileUrl",
DROP COLUMN "password",
DROP COLUMN "qrBinaryBytes",
DROP COLUMN "sufix";
