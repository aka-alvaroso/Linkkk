-- CreateIndex
CREATE INDEX "Access_linkId_idx" ON "Access"("linkId");

-- CreateIndex
CREATE INDEX "Access_linkId_createdAt_idx" ON "Access"("linkId", "createdAt");
