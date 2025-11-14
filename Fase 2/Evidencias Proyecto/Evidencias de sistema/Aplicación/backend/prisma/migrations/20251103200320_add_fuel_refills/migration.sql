-- CreateTable
CREATE TABLE "public"."recargas_combustible" (
    "id" SERIAL NOT NULL,
    "vehicleId" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "liters" DECIMAL(10,2) NOT NULL,
    "pricePerLiter" DECIMAL(10,2) NOT NULL,
    "totalCost" DECIMAL(10,2) NOT NULL,
    "station" TEXT NOT NULL,
    "currentKm" INTEGER NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "recargas_combustible_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "recargas_combustible_vehicleId_idx" ON "public"."recargas_combustible"("vehicleId");

-- CreateIndex
CREATE INDEX "recargas_combustible_date_idx" ON "public"."recargas_combustible"("date");

-- AddForeignKey
ALTER TABLE "public"."recargas_combustible" ADD CONSTRAINT "recargas_combustible_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "public"."vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
