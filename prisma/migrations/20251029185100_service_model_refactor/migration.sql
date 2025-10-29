/*
  Warnings:

  - You are about to drop the column `subscriptionId` on the `expenses` table. All the data in the column will be lost.
  - You are about to drop the column `subscriptionId` on the `invoices` table. All the data in the column will be lost.
  - You are about to drop the column `subscriptionId` on the `recurring_expenses` table. All the data in the column will be lost.
  - You are about to drop the `plans` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `subscriptions` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "ServiceCategory" AS ENUM ('APP', 'SITE', 'SYSTEM', 'CONSULTING', 'SUPPORT', 'OTHER');

-- CreateEnum
CREATE TYPE "ServiceStatus" AS ENUM ('PROPOSED', 'IMPLEMENTATION', 'ACTIVE', 'PAUSED', 'CANCELLED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ServiceBillingStatus" AS ENUM ('PENDING', 'ACTIVE', 'PAUSED', 'CANCELLED', 'TERMINATED');

-- DropForeignKey
ALTER TABLE "public"."expenses" DROP CONSTRAINT "expenses_subscriptionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."invoices" DROP CONSTRAINT "invoices_subscriptionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."recurring_expenses" DROP CONSTRAINT "recurring_expenses_subscriptionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."subscriptions" DROP CONSTRAINT "subscriptions_clientId_fkey";

-- DropForeignKey
ALTER TABLE "public"."subscriptions" DROP CONSTRAINT "subscriptions_contractId_fkey";

-- DropForeignKey
ALTER TABLE "public"."subscriptions" DROP CONSTRAINT "subscriptions_planId_fkey";

-- DropIndex
DROP INDEX "public"."expenses_subscriptionId_idx";

-- DropIndex
DROP INDEX "public"."recurring_expenses_subscriptionId_idx";

-- AlterTable
ALTER TABLE "expenses" DROP COLUMN "subscriptionId",
ADD COLUMN     "clientServiceId" TEXT,
ADD COLUMN     "serviceBillingId" TEXT;

-- AlterTable
ALTER TABLE "invoices" DROP COLUMN "subscriptionId",
ADD COLUMN     "clientServiceId" TEXT,
ADD COLUMN     "serviceBillingId" TEXT;

-- AlterTable
ALTER TABLE "recurring_expenses" DROP COLUMN "subscriptionId",
ADD COLUMN     "clientServiceId" TEXT,
ADD COLUMN     "serviceBillingId" TEXT;

-- DropTable
DROP TABLE "public"."plans";

-- DropTable
DROP TABLE "public"."subscriptions";

-- CreateTable
CREATE TABLE "service_templates" (
    "id" TEXT NOT NULL,
    "externalId" TEXT,
    "name" TEXT NOT NULL,
    "category" "ServiceCategory" NOT NULL DEFAULT 'OTHER',
    "description" TEXT,
    "baseMonthlyFee" DECIMAL(12,2),
    "setupFee" DECIMAL(12,2),
    "defaultBillingCycle" "Cycle" NOT NULL DEFAULT 'MONTHLY',
    "deliverables" TEXT,
    "stack" TEXT,
    "meta" JSONB,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "client_services" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "templateId" TEXT,
    "contractId" TEXT,
    "externalId" TEXT,
    "title" TEXT NOT NULL,
    "scope" TEXT,
    "status" "ServiceStatus" NOT NULL DEFAULT 'PROPOSED',
    "responsible" TEXT,
    "hostingProvider" TEXT,
    "repositoryUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "environmentLinks" JSONB,
    "defaultMonthlyFee" DECIMAL(12,2),
    "currency" TEXT NOT NULL DEFAULT 'BRL',
    "billingCycle" "Cycle" NOT NULL DEFAULT 'MONTHLY',
    "supportLevel" TEXT,
    "startDate" TIMESTAMP(3),
    "goLiveDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "meta" JSONB,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "client_services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_billings" (
    "id" TEXT NOT NULL,
    "clientServiceId" TEXT NOT NULL,
    "externalId" TEXT,
    "status" "ServiceBillingStatus" NOT NULL DEFAULT 'PENDING',
    "cycle" "Cycle" NOT NULL DEFAULT 'MONTHLY',
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "monthlyAmount" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'BRL',
    "adjustmentIndex" DECIMAL(6,4),
    "notes" TEXT,
    "meta" JSONB,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_billings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "service_templates_externalId_key" ON "service_templates"("externalId");

-- CreateIndex
CREATE INDEX "service_templates_category_idx" ON "service_templates"("category");

-- CreateIndex
CREATE UNIQUE INDEX "client_services_externalId_key" ON "client_services"("externalId");

-- CreateIndex
CREATE INDEX "client_services_clientId_idx" ON "client_services"("clientId");

-- CreateIndex
CREATE INDEX "client_services_status_idx" ON "client_services"("status");

-- CreateIndex
CREATE INDEX "client_services_templateId_idx" ON "client_services"("templateId");

-- CreateIndex
CREATE INDEX "client_services_contractId_idx" ON "client_services"("contractId");

-- CreateIndex
CREATE UNIQUE INDEX "service_billings_externalId_key" ON "service_billings"("externalId");

-- CreateIndex
CREATE INDEX "service_billings_clientServiceId_idx" ON "service_billings"("clientServiceId");

-- CreateIndex
CREATE INDEX "service_billings_status_idx" ON "service_billings"("status");

-- CreateIndex
CREATE INDEX "expenses_clientServiceId_idx" ON "expenses"("clientServiceId");

-- CreateIndex
CREATE INDEX "expenses_serviceBillingId_idx" ON "expenses"("serviceBillingId");

-- CreateIndex
CREATE INDEX "invoices_clientServiceId_idx" ON "invoices"("clientServiceId");

-- CreateIndex
CREATE INDEX "invoices_serviceBillingId_idx" ON "invoices"("serviceBillingId");

-- CreateIndex
CREATE INDEX "recurring_expenses_clientServiceId_idx" ON "recurring_expenses"("clientServiceId");

-- CreateIndex
CREATE INDEX "recurring_expenses_serviceBillingId_idx" ON "recurring_expenses"("serviceBillingId");

-- AddForeignKey
ALTER TABLE "client_services" ADD CONSTRAINT "client_services_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_services" ADD CONSTRAINT "client_services_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "service_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_services" ADD CONSTRAINT "client_services_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "contracts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_billings" ADD CONSTRAINT "service_billings_clientServiceId_fkey" FOREIGN KEY ("clientServiceId") REFERENCES "client_services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_clientServiceId_fkey" FOREIGN KEY ("clientServiceId") REFERENCES "client_services"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_serviceBillingId_fkey" FOREIGN KEY ("serviceBillingId") REFERENCES "service_billings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recurring_expenses" ADD CONSTRAINT "recurring_expenses_clientServiceId_fkey" FOREIGN KEY ("clientServiceId") REFERENCES "client_services"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recurring_expenses" ADD CONSTRAINT "recurring_expenses_serviceBillingId_fkey" FOREIGN KEY ("serviceBillingId") REFERENCES "service_billings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_clientServiceId_fkey" FOREIGN KEY ("clientServiceId") REFERENCES "client_services"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_serviceBillingId_fkey" FOREIGN KEY ("serviceBillingId") REFERENCES "service_billings"("id") ON DELETE SET NULL ON UPDATE CASCADE;
