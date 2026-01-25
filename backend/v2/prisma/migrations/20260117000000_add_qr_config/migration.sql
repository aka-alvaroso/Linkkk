-- CreateEnum
CREATE TYPE "DotsStyle" AS ENUM ('square', 'rounded', 'dots');

-- CreateEnum
CREATE TYPE "CornersStyle" AS ENUM ('square', 'rounded');

-- CreateTable
CREATE TABLE "QRConfig" (
    "id" SERIAL NOT NULL,
    "linkId" INTEGER NOT NULL,
    "foregroundColor" TEXT NOT NULL DEFAULT '#000000',
    "backgroundColor" TEXT NOT NULL DEFAULT '#FFFFFF',
    "logoUrl" TEXT,
    "logoSize" DOUBLE PRECISION NOT NULL DEFAULT 0.3,
    "dotsStyle" "DotsStyle" NOT NULL DEFAULT 'square',
    "cornersStyle" "CornersStyle" NOT NULL DEFAULT 'square',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QRConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "QRConfig_linkId_key" ON "QRConfig"("linkId");

-- CreateIndex
CREATE INDEX "QRConfig_linkId_idx" ON "QRConfig"("linkId");

-- AddForeignKey
ALTER TABLE "QRConfig" ADD CONSTRAINT "QRConfig_linkId_fkey" FOREIGN KEY ("linkId") REFERENCES "Link"("id") ON DELETE CASCADE ON UPDATE CASCADE;
