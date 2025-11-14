-- CreateEnum
CREATE TYPE "public"."VehicleStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'MAINTENANCE', 'SOLD');

-- CreateEnum
CREATE TYPE "public"."VehicleCondition" AS ENUM ('NEW', 'USED');

-- CreateTable
CREATE TABLE "public"."vehicles" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "licensePlate" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "engine" TEXT NOT NULL,
    "currentKm" INTEGER NOT NULL DEFAULT 0,
    "condition" "public"."VehicleCondition" NOT NULL DEFAULT 'USED',
    "purchaseDate" TIMESTAMP(3),
    "purchasePrice" DECIMAL(10,2),
    "status" "public"."VehicleStatus" NOT NULL DEFAULT 'ACTIVE',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_licensePlate_key" ON "public"."vehicles"("licensePlate");

-- CreateIndex
CREATE INDEX "vehicles_userId_idx" ON "public"."vehicles"("userId");

-- CreateIndex
CREATE INDEX "vehicles_licensePlate_idx" ON "public"."vehicles"("licensePlate");

-- AddForeignKey
ALTER TABLE "public"."vehicles" ADD CONSTRAINT "vehicles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
