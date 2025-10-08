/*
  Warnings:

  - You are about to drop the column `UserAgent` on the `Access` table. All the data in the column will be lost.
  - Added the required column `userAgent` to the `Access` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Access" DROP COLUMN "UserAgent",
ADD COLUMN     "userAgent" TEXT NOT NULL;
