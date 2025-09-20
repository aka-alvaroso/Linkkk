/*
  Warnings:

  - A unique constraint covering the columns `[sufix]` on the table `Link` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Link_sufix_key" ON "Link"("sufix");
