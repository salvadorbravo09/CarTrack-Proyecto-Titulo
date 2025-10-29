-- CreateTable
CREATE TABLE "public"."tipos_mantenimiento" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tipos_mantenimiento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."mantenimientos" (
    "id" SERIAL NOT NULL,
    "vehicleId" INTEGER NOT NULL,
    "maintenanceTypeId" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "description" TEXT NOT NULL,
    "workshopName" TEXT,
    "cost" DECIMAL(10,2),
    "mileage" INTEGER NOT NULL,
    "observations" TEXT,
    "status" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "mantenimientos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."documentos_vehiculo" (
    "id" SERIAL NOT NULL,
    "vehicleId" INTEGER NOT NULL,
    "documentType" TEXT NOT NULL,
    "documentNumber" TEXT,
    "fileUrl" TEXT,
    "issueDate" TIMESTAMP(3),
    "expiryDate" TIMESTAMP(3),
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "documentos_vehiculo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."transferencias_vehiculos" (
    "id" SERIAL NOT NULL,
    "vehicleId" INTEGER NOT NULL,
    "originUserId" INTEGER NOT NULL,
    "destinationUserId" INTEGER NOT NULL,
    "transferEmail" TEXT NOT NULL,
    "transferCode" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "message" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transferencias_vehiculos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tipos_mantenimiento_name_key" ON "public"."tipos_mantenimiento"("name");

-- CreateIndex
CREATE INDEX "mantenimientos_vehicleId_idx" ON "public"."mantenimientos"("vehicleId");

-- CreateIndex
CREATE INDEX "mantenimientos_maintenanceTypeId_idx" ON "public"."mantenimientos"("maintenanceTypeId");

-- CreateIndex
CREATE INDEX "mantenimientos_date_idx" ON "public"."mantenimientos"("date");

-- CreateIndex
CREATE INDEX "documentos_vehiculo_vehicleId_idx" ON "public"."documentos_vehiculo"("vehicleId");

-- CreateIndex
CREATE INDEX "documentos_vehiculo_expiryDate_idx" ON "public"."documentos_vehiculo"("expiryDate");

-- CreateIndex
CREATE UNIQUE INDEX "transferencias_vehiculos_transferCode_key" ON "public"."transferencias_vehiculos"("transferCode");

-- CreateIndex
CREATE INDEX "transferencias_vehiculos_vehicleId_idx" ON "public"."transferencias_vehiculos"("vehicleId");

-- CreateIndex
CREATE INDEX "transferencias_vehiculos_originUserId_idx" ON "public"."transferencias_vehiculos"("originUserId");

-- CreateIndex
CREATE INDEX "transferencias_vehiculos_destinationUserId_idx" ON "public"."transferencias_vehiculos"("destinationUserId");

-- CreateIndex
CREATE INDEX "transferencias_vehiculos_transferCode_idx" ON "public"."transferencias_vehiculos"("transferCode");

-- AddForeignKey
ALTER TABLE "public"."mantenimientos" ADD CONSTRAINT "mantenimientos_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "public"."vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."mantenimientos" ADD CONSTRAINT "mantenimientos_maintenanceTypeId_fkey" FOREIGN KEY ("maintenanceTypeId") REFERENCES "public"."tipos_mantenimiento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."documentos_vehiculo" ADD CONSTRAINT "documentos_vehiculo_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "public"."vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."transferencias_vehiculos" ADD CONSTRAINT "transferencias_vehiculos_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "public"."vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."transferencias_vehiculos" ADD CONSTRAINT "transferencias_vehiculos_originUserId_fkey" FOREIGN KEY ("originUserId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."transferencias_vehiculos" ADD CONSTRAINT "transferencias_vehiculos_destinationUserId_fkey" FOREIGN KEY ("destinationUserId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
