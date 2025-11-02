/*
  Service logistics refactor
  -------------------------
  - Retira planos/assinaturas legados (plans/subscriptions)
  - Remove o catálogo de templates de serviço, mantendo somente serviços customizados por cliente
  - Atualiza enums e colunas para refletir as novas categorias e os novos campos financeiros
  - Preserva os dados existentes em client_services/service_billings sempre que possível
*/

-- === Remoção de vínculos com planos/assinaturas (pipeline antigo) ===
ALTER TABLE "public"."expenses" DROP CONSTRAINT IF EXISTS "expenses_subscriptionId_fkey";
ALTER TABLE "public"."invoices" DROP CONSTRAINT IF EXISTS "invoices_subscriptionId_fkey";
ALTER TABLE "public"."recurring_expenses" DROP CONSTRAINT IF EXISTS "recurring_expenses_subscriptionId_fkey";
ALTER TABLE "public"."subscriptions" DROP CONSTRAINT IF EXISTS "subscriptions_clientId_fkey";
ALTER TABLE "public"."subscriptions" DROP CONSTRAINT IF EXISTS "subscriptions_contractId_fkey";
ALTER TABLE "public"."subscriptions" DROP CONSTRAINT IF EXISTS "subscriptions_planId_fkey";

DROP INDEX IF EXISTS "public"."expenses_subscriptionId_idx";
DROP INDEX IF EXISTS "public"."recurring_expenses_subscriptionId_idx";

-- === Ajuste do relacionamento com templates de serviço ===
ALTER TABLE "public"."client_services" DROP CONSTRAINT IF EXISTS "client_services_templateId_fkey";
DROP INDEX IF EXISTS "public"."client_services_templateId_idx";

-- === Remoção de estruturas legadas ===
DROP TABLE IF EXISTS "public"."service_templates";
DROP TABLE IF EXISTS "public"."subscriptions";
DROP TABLE IF EXISTS "public"."plans";

-- === Atualização dos enums de serviço ===
DO $$ BEGIN
  -- recria as enums apenas se já existiam, para evitar conflitos em deploys limpos
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ServiceCategory') THEN
    DROP TYPE "ServiceCategory";
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ServiceStatus') THEN
    DROP TYPE "ServiceStatus";
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ServiceBillingStatus') THEN
    DROP TYPE "ServiceBillingStatus";
  END IF;
END $$;

CREATE TYPE "ServiceCategory" AS ENUM ('APPS', 'SITES', 'SOFTWARE', 'AUTOMATIONS', 'OTHERS');
CREATE TYPE "ServiceStatus" AS ENUM ('PROPOSED', 'IMPLEMENTATION', 'ACTIVE', 'PAUSED', 'CANCELLED', 'ARCHIVED');
CREATE TYPE "ServiceBillingStatus" AS ENUM ('PENDING', 'ACTIVE', 'PAUSED', 'CANCELLED', 'TERMINATED');

-- === Adequações em client_services ===
ALTER TABLE "public"."client_services"
    DROP COLUMN IF EXISTS "meta",
    DROP COLUMN IF EXISTS "tags",
    DROP COLUMN IF EXISTS "templateId",
    ADD COLUMN IF NOT EXISTS "developmentFee" DECIMAL(12,2),
    ADD COLUMN IF NOT EXISTS "category" "ServiceCategory";

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'client_services'
      AND column_name = 'defaultMonthlyFee'
  ) THEN
    ALTER TABLE "public"."client_services" RENAME COLUMN "defaultMonthlyFee" TO "monthlyFee";
  END IF;
END $$;

ALTER TABLE "public"."client_services"
    ADD COLUMN IF NOT EXISTS "monthlyFee" DECIMAL(12,2);

-- Garante valor default para registros existentes, depois marca NOT NULL
UPDATE "public"."client_services"
SET "category" = COALESCE("category", 'OTHERS');

ALTER TABLE "public"."client_services"
    ALTER COLUMN "category" SET NOT NULL,
    ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

CREATE UNIQUE INDEX IF NOT EXISTS "client_services_externalId_key" ON "public"."client_services"("externalId");
CREATE INDEX IF NOT EXISTS "client_services_clientId_idx" ON "public"."client_services"("clientId");
CREATE INDEX IF NOT EXISTS "client_services_status_idx" ON "public"."client_services"("status");
CREATE INDEX IF NOT EXISTS "client_services_contractId_idx" ON "public"."client_services"("contractId");

-- === Adequações em service_billings ===
ALTER TABLE "public"."service_billings"
    DROP COLUMN IF EXISTS "meta",
    DROP COLUMN IF EXISTS "tags";

CREATE UNIQUE INDEX IF NOT EXISTS "service_billings_externalId_key" ON "public"."service_billings"("externalId");
CREATE INDEX IF NOT EXISTS "service_billings_clientServiceId_idx" ON "public"."service_billings"("clientServiceId");
CREATE INDEX IF NOT EXISTS "service_billings_status_idx" ON "public"."service_billings"("status");

-- === Relacionamentos dos novos campos ===
ALTER TABLE "public"."expenses"
    ADD COLUMN IF NOT EXISTS "clientServiceId" TEXT,
    ADD COLUMN IF NOT EXISTS "serviceBillingId" TEXT;

ALTER TABLE "public"."invoices"
    ADD COLUMN IF NOT EXISTS "clientServiceId" TEXT,
    ADD COLUMN IF NOT EXISTS "serviceBillingId" TEXT;

ALTER TABLE "public"."recurring_expenses"
    ADD COLUMN IF NOT EXISTS "clientServiceId" TEXT,
    ADD COLUMN IF NOT EXISTS "serviceBillingId" TEXT;

CREATE INDEX IF NOT EXISTS "expenses_clientServiceId_idx" ON "public"."expenses"("clientServiceId");
CREATE INDEX IF NOT EXISTS "expenses_serviceBillingId_idx" ON "public"."expenses"("serviceBillingId");

CREATE INDEX IF NOT EXISTS "invoices_clientServiceId_idx" ON "public"."invoices"("clientServiceId");
CREATE INDEX IF NOT EXISTS "invoices_serviceBillingId_idx" ON "public"."invoices"("serviceBillingId");

CREATE INDEX IF NOT EXISTS "recurring_expenses_clientServiceId_idx" ON "public"."recurring_expenses"("clientServiceId");
CREATE INDEX IF NOT EXISTS "recurring_expenses_serviceBillingId_idx" ON "public"."recurring_expenses"("serviceBillingId");

-- === Restaura chaves estrangeiras alinhadas ao novo fluxo ===
ALTER TABLE "public"."client_services"
    DROP CONSTRAINT IF EXISTS "client_services_clientId_fkey",
    DROP CONSTRAINT IF EXISTS "client_services_contractId_fkey",
    ADD CONSTRAINT "client_services_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."clients"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    ADD CONSTRAINT "client_services_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "public"."contracts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "public"."service_billings"
    DROP CONSTRAINT IF EXISTS "service_billings_clientServiceId_fkey",
    ADD CONSTRAINT "service_billings_clientServiceId_fkey" FOREIGN KEY ("clientServiceId") REFERENCES "public"."client_services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "public"."invoices"
    DROP CONSTRAINT IF EXISTS "invoices_clientServiceId_fkey",
    DROP CONSTRAINT IF EXISTS "invoices_serviceBillingId_fkey",
    ADD CONSTRAINT "invoices_clientServiceId_fkey" FOREIGN KEY ("clientServiceId") REFERENCES "public"."client_services"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    ADD CONSTRAINT "invoices_serviceBillingId_fkey" FOREIGN KEY ("serviceBillingId") REFERENCES "public"."service_billings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "public"."recurring_expenses"
    DROP CONSTRAINT IF EXISTS "recurring_expenses_clientServiceId_fkey",
    DROP CONSTRAINT IF EXISTS "recurring_expenses_serviceBillingId_fkey",
    ADD CONSTRAINT "recurring_expenses_clientServiceId_fkey" FOREIGN KEY ("clientServiceId") REFERENCES "public"."client_services"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    ADD CONSTRAINT "recurring_expenses_serviceBillingId_fkey" FOREIGN KEY ("serviceBillingId") REFERENCES "public"."service_billings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "public"."expenses"
    DROP CONSTRAINT IF EXISTS "expenses_clientServiceId_fkey",
    DROP CONSTRAINT IF EXISTS "expenses_serviceBillingId_fkey",
    ADD CONSTRAINT "expenses_clientServiceId_fkey" FOREIGN KEY ("clientServiceId") REFERENCES "public"."client_services"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    ADD CONSTRAINT "expenses_serviceBillingId_fkey" FOREIGN KEY ("serviceBillingId") REFERENCES "public"."service_billings"("id") ON DELETE SET NULL ON UPDATE CASCADE;
