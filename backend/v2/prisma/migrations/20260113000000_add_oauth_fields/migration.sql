-- AlterTable
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "oauthId" TEXT,
ADD COLUMN IF NOT EXISTS "oauthProvider" TEXT,
ALTER COLUMN "password" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "User_oauthProvider_oauthId_key" ON "User"("oauthProvider", "oauthId");
