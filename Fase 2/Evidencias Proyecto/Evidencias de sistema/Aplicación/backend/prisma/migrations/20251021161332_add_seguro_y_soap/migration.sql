-- CreateTable
CREATE TABLE "public"."seguros_vehiculares" (
    "id" SERIAL NOT NULL,
    "vehicleId" INTEGER NOT NULL,
    "compania" TEXT NOT NULL,
    "tipoCobertura" TEXT NOT NULL,
    "costo" DECIMAL(10,2) NOT NULL,
    "deducible" DECIMAL(10,2) NOT NULL,
    "fechaInicio" TIMESTAMP(3) NOT NULL,
    "fechaFin" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "seguros_vehiculares_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."soaps" (
    "id" SERIAL NOT NULL,
    "vehicleId" INTEGER NOT NULL,
    "compania" TEXT NOT NULL,
    "lugarCompra" TEXT,
    "numeroPoliza" TEXT,
    "fechaVigencia" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "soaps_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "seguros_vehiculares_vehicleId_idx" ON "public"."seguros_vehiculares"("vehicleId");

-- CreateIndex
CREATE INDEX "soaps_vehicleId_idx" ON "public"."soaps"("vehicleId");

-- AddForeignKey
ALTER TABLE "public"."seguros_vehiculares" ADD CONSTRAINT "seguros_vehiculares_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "public"."vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."soaps" ADD CONSTRAINT "soaps_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "public"."vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
