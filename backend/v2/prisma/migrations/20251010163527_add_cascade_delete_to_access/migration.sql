-- DropForeignKey
ALTER TABLE "Access" DROP CONSTRAINT "Access_linkId_fkey";

-- AddForeignKey
ALTER TABLE "Access" ADD CONSTRAINT "Access_linkId_fkey" FOREIGN KEY ("linkId") REFERENCES "Link"("id") ON DELETE CASCADE ON UPDATE CASCADE;
