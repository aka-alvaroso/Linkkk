/*
  Warnings:

  - You are about to drop the column `date` on the `Access` table. All the data in the column will be lost.
  - You are about to drop the column `device` on the `Access` table. All the data in the column will be lost.
  - You are about to drop the column `is_vpn` on the `Access` table. All the data in the column will be lost.
  - You are about to drop the column `method` on the `Access` table. All the data in the column will be lost.
  - You are about to drop the column `d_expire` on the `Link` table. All the data in the column will be lost.
  - You are about to drop the column `groupId` on the `Link` table. All the data in the column will be lost.
  - You are about to drop the column `guest_sessionId` on the `Link` table. All the data in the column will be lost.
  - You are about to drop the column `useCustomMetadata` on the `Link` table. All the data in the column will be lost.
  - You are about to drop the column `useGeoBlocking` on the `Link` table. All the data in the column will be lost.
  - You are about to drop the column `useSmartRedirection` on the `Link` table. All the data in the column will be lost.
  - You are about to drop the column `planId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `stripeCustomerId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `stripeSubscriptionId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `subscriptionStatus` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Country` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Group` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Plan` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Tag` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_LinkCountries` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_LinkTags` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `UserAgent` to the `Access` table without a default value. This is not possible if the table is not empty.
  - Added the required column `isBot` to the `Access` table without a default value. This is not possible if the table is not empty.
  - Added the required column `isVPN` to the `Access` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Access" DROP CONSTRAINT "Access_linkId_fkey";

-- DropForeignKey
ALTER TABLE "Group" DROP CONSTRAINT "Group_userId_fkey";

-- DropForeignKey
ALTER TABLE "Link" DROP CONSTRAINT "Link_groupId_fkey";

-- DropForeignKey
ALTER TABLE "Link" DROP CONSTRAINT "Link_guest_sessionId_fkey";

-- DropForeignKey
ALTER TABLE "Tag" DROP CONSTRAINT "Tag_userId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_planId_fkey";

-- DropForeignKey
ALTER TABLE "_LinkCountries" DROP CONSTRAINT "_LinkCountries_A_fkey";

-- DropForeignKey
ALTER TABLE "_LinkCountries" DROP CONSTRAINT "_LinkCountries_B_fkey";

-- DropForeignKey
ALTER TABLE "_LinkTags" DROP CONSTRAINT "_LinkTags_A_fkey";

-- DropForeignKey
ALTER TABLE "_LinkTags" DROP CONSTRAINT "_LinkTags_B_fkey";

-- AlterTable
ALTER TABLE "Access" DROP COLUMN "date",
DROP COLUMN "device",
DROP COLUMN "is_vpn",
DROP COLUMN "method",
ADD COLUMN     "UserAgent" TEXT NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "isBot" BOOLEAN NOT NULL,
ADD COLUMN     "isVPN" BOOLEAN NOT NULL;

-- AlterTable
ALTER TABLE "Link" DROP COLUMN "d_expire",
DROP COLUMN "groupId",
DROP COLUMN "guest_sessionId",
DROP COLUMN "useCustomMetadata",
DROP COLUMN "useGeoBlocking",
DROP COLUMN "useSmartRedirection",
ADD COLUMN     "blockedCountries" TEXT[],
ADD COLUMN     "dateExpire" TIMESTAMP(3),
ADD COLUMN     "guestSessionId" INTEGER;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "planId",
DROP COLUMN "stripeCustomerId",
DROP COLUMN "stripeSubscriptionId",
DROP COLUMN "subscriptionStatus";

-- DropTable
DROP TABLE "Country";

-- DropTable
DROP TABLE "Group";

-- DropTable
DROP TABLE "Plan";

-- DropTable
DROP TABLE "Tag";

-- DropTable
DROP TABLE "_LinkCountries";

-- DropTable
DROP TABLE "_LinkTags";

-- DropEnum
DROP TYPE "Colors";

-- DropEnum
DROP TYPE "Device";

-- DropEnum
DROP TYPE "Method";

-- AddForeignKey
ALTER TABLE "Link" ADD CONSTRAINT "Link_guestSessionId_fkey" FOREIGN KEY ("guestSessionId") REFERENCES "GuestSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Access" ADD CONSTRAINT "Access_linkId_fkey" FOREIGN KEY ("linkId") REFERENCES "Link"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
