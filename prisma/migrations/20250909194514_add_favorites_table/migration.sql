-- CreateEnum
CREATE TYPE "public"."UpdateType" AS ENUM ('TEXT_ONLY', 'TEXT_IMAGE', 'TEXT_VIDEO');

-- AlterTable
ALTER TABLE "public"."campaign_updates" ADD COLUMN     "type" "public"."UpdateType" NOT NULL DEFAULT 'TEXT_ONLY',
ADD COLUMN     "videos" TEXT[];

-- AlterTable
ALTER TABLE "public"."campaigns" ALTER COLUMN "currency" SET DEFAULT 'UYU';

-- AlterTable
ALTER TABLE "public"."comments" ADD COLUMN     "parentId" TEXT;

-- AlterTable
ALTER TABLE "public"."donations" ALTER COLUMN "currency" SET DEFAULT 'UYU';

-- CreateTable
CREATE TABLE "public"."favorites" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,

    CONSTRAINT "favorites_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "favorites_userId_campaignId_key" ON "public"."favorites"("userId", "campaignId");

-- AddForeignKey
ALTER TABLE "public"."comments" ADD CONSTRAINT "comments_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "public"."comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."favorites" ADD CONSTRAINT "favorites_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."favorites" ADD CONSTRAINT "favorites_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "public"."campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;
