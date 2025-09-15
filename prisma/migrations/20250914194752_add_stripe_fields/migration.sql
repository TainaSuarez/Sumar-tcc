-- AlterTable
ALTER TABLE "public"."donations" ADD COLUMN     "stripeChargeId" TEXT,
ADD COLUMN     "stripeClientSecret" TEXT,
ADD COLUMN     "stripeCustomerId" TEXT,
ADD COLUMN     "stripeMetadata" JSONB,
ADD COLUMN     "stripePaymentIntentId" TEXT;
