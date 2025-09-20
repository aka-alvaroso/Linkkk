/*
  Warnings:

  - You are about to drop the `_LinkGroups` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_LinkGroups" DROP CONSTRAINT "_LinkGroups_A_fkey";

-- DropForeignKey
ALTER TABLE "_LinkGroups" DROP CONSTRAINT "_LinkGroups_B_fkey";

-- AlterTable
ALTER TABLE "Link" ADD COLUMN     "groupId" INTEGER;

-- DropTable
DROP TABLE "_LinkGroups";

-- AddForeignKey
ALTER TABLE "Link" ADD CONSTRAINT "Link_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE SET NULL ON UPDATE CASCADE;
