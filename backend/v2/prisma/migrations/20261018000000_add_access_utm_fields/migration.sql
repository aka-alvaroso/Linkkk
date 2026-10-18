-- AlterTable
ALTER TABLE "Access" ADD COLUMN     "utmCampaign" TEXT,
ADD COLUMN     "utmContent" TEXT,
ADD COLUMN     "utmMedium" TEXT,
ADD COLUMN     "utmSource" TEXT,
ADD COLUMN     "utmTerm" TEXT;

-- CreateIndex
CREATE INDEX "Access_linkId_utmCampaign_idx" ON "Access"("linkId", "utmCampaign");
