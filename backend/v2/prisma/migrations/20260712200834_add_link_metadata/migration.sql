-- CreateTable
CREATE TABLE "LinkMetadata" (
    "id" SERIAL NOT NULL,
    "linkId" INTEGER NOT NULL,
    "ogTitle" TEXT,
    "ogDescription" TEXT,
    "ogImageUrl" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LinkMetadata_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LinkMetadata_linkId_key" ON "LinkMetadata"("linkId");

-- CreateIndex
CREATE INDEX "LinkMetadata_linkId_idx" ON "LinkMetadata"("linkId");

-- AddForeignKey
ALTER TABLE "LinkMetadata" ADD CONSTRAINT "LinkMetadata_linkId_fkey" FOREIGN KEY ("linkId") REFERENCES "Link"("id") ON DELETE CASCADE ON UPDATE CASCADE;
