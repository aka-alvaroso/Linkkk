-- CreateEnum
CREATE TYPE "MatchType" AS ENUM ('AND', 'OR');

-- CreateEnum
CREATE TYPE "FieldType" AS ENUM ('country', 'device', 'ip', 'is_bot', 'is_vpn', 'date', 'access_count');

-- CreateEnum
CREATE TYPE "OperatorType" AS ENUM ('equals', 'not_equals', 'in', 'not_in', 'greater_than', 'less_than', 'before', 'after', 'contains', 'not_contains');

-- CreateEnum
CREATE TYPE "ActionType" AS ENUM ('redirect', 'block_access', 'notify', 'password_gate');

-- AlterTable
ALTER TABLE "Link" ADD COLUMN     "accessCount" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "LinkRule" (
    "id" SERIAL NOT NULL,
    "linkId" INTEGER NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "match" "MatchType" NOT NULL DEFAULT 'AND',
    "actionType" "ActionType" NOT NULL,
    "actionSettings" JSONB,
    "elseActionType" "ActionType",
    "elseActionSettings" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LinkRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RuleCondition" (
    "id" SERIAL NOT NULL,
    "ruleId" INTEGER NOT NULL,
    "field" "FieldType" NOT NULL,
    "operator" "OperatorType" NOT NULL,
    "value" JSONB NOT NULL,

    CONSTRAINT "RuleCondition_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LinkRule_linkId_priority_idx" ON "LinkRule"("linkId", "priority");

-- CreateIndex
CREATE INDEX "LinkRule_linkId_enabled_idx" ON "LinkRule"("linkId", "enabled");

-- CreateIndex
CREATE INDEX "RuleCondition_ruleId_idx" ON "RuleCondition"("ruleId");

-- CreateIndex
CREATE INDEX "Link_shortUrl_idx" ON "Link"("shortUrl");

-- AddForeignKey
ALTER TABLE "LinkRule" ADD CONSTRAINT "LinkRule_linkId_fkey" FOREIGN KEY ("linkId") REFERENCES "Link"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RuleCondition" ADD CONSTRAINT "RuleCondition_ruleId_fkey" FOREIGN KEY ("ruleId") REFERENCES "LinkRule"("id") ON DELETE CASCADE ON UPDATE CASCADE;
