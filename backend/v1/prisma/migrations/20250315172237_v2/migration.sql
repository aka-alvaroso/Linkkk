/*
  Warnings:

  - You are about to drop the column `d_creation` on the `Group` table. All the data in the column will be lost.
  - You are about to drop the column `d_creation` on the `Link` table. All the data in the column will be lost.
  - You are about to drop the column `d_register` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Group" DROP COLUMN "d_creation",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Link" DROP COLUMN "d_creation",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "d_register",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
