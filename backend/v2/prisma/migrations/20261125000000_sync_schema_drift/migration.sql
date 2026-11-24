-- Catch-up migration: brings a database built ONLY from the migration history
-- up to date with schema.prisma.
--
-- Groups, tags, custom domains, Link.groupId/customDomainId/scanCount,
-- Access.source and LinkRule.name existed in schema.prisma (and in production)
-- but no migration created them, so a fresh database (staging, CI, a rebuild
-- after a disaster) failed with errors like "column Link.groupId does not exist".
-- Migration 20251008184540 even dropped Link.groupId and nothing re-added it.
--
-- Everything here is idempotent on purpose: production already has these
-- objects, so each statement must be a no-op there.

-- CreateEnum
DO $$ BEGIN
  CREATE TYPE "CustomDomainStatus" AS ENUM ('PENDING', 'VERIFYING', 'ACTIVE', 'ERROR');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- AlterTable
ALTER TABLE "Access" ADD COLUMN IF NOT EXISTS "source" TEXT NOT NULL DEFAULT 'direct';

ALTER TABLE "Link"
  ADD COLUMN IF NOT EXISTS "customDomainId" INTEGER,
  ADD COLUMN IF NOT EXISTS "groupId" INTEGER,
  ADD COLUMN IF NOT EXISTS "scanCount" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE "LinkRule" ADD COLUMN IF NOT EXISTS "name" TEXT;

-- CreateTable
CREATE TABLE IF NOT EXISTS "Group" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Group_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Tag" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "LinkTag" (
    "linkId" INTEGER NOT NULL,
    "tagId" INTEGER NOT NULL,

    CONSTRAINT "LinkTag_pkey" PRIMARY KEY ("linkId","tagId")
);

CREATE TABLE IF NOT EXISTS "CustomDomain" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "domain" TEXT NOT NULL,
    "status" "CustomDomainStatus" NOT NULL DEFAULT 'PENDING',
    "errorMsg" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomDomain_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Group_userId_idx" ON "Group"("userId");
CREATE UNIQUE INDEX IF NOT EXISTS "Group_name_userId_key" ON "Group"("name", "userId");
CREATE INDEX IF NOT EXISTS "Tag_userId_idx" ON "Tag"("userId");
CREATE UNIQUE INDEX IF NOT EXISTS "Tag_name_userId_key" ON "Tag"("name", "userId");
CREATE UNIQUE INDEX IF NOT EXISTS "CustomDomain_domain_key" ON "CustomDomain"("domain");
CREATE INDEX IF NOT EXISTS "CustomDomain_userId_idx" ON "CustomDomain"("userId");
CREATE INDEX IF NOT EXISTS "CustomDomain_domain_status_idx" ON "CustomDomain"("domain", "status");
CREATE INDEX IF NOT EXISTS "Access_linkId_source_idx" ON "Access"("linkId", "source");
CREATE INDEX IF NOT EXISTS "Link_userId_groupId_idx" ON "Link"("userId", "groupId");
CREATE INDEX IF NOT EXISTS "Link_customDomainId_idx" ON "Link"("customDomainId");

-- AddForeignKey (PostgreSQL has no IF NOT EXISTS for constraints, so check first)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Link_groupId_fkey') THEN
    ALTER TABLE "Link" ADD CONSTRAINT "Link_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Link_customDomainId_fkey') THEN
    ALTER TABLE "Link" ADD CONSTRAINT "Link_customDomainId_fkey" FOREIGN KEY ("customDomainId") REFERENCES "CustomDomain"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Group_userId_fkey') THEN
    ALTER TABLE "Group" ADD CONSTRAINT "Group_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Tag_userId_fkey') THEN
    ALTER TABLE "Tag" ADD CONSTRAINT "Tag_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'LinkTag_linkId_fkey') THEN
    ALTER TABLE "LinkTag" ADD CONSTRAINT "LinkTag_linkId_fkey" FOREIGN KEY ("linkId") REFERENCES "Link"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'LinkTag_tagId_fkey') THEN
    ALTER TABLE "LinkTag" ADD CONSTRAINT "LinkTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'CustomDomain_userId_fkey') THEN
    ALTER TABLE "CustomDomain" ADD CONSTRAINT "CustomDomain_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
