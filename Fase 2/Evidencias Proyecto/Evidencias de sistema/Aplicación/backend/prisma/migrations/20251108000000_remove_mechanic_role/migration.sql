-- Primero, actualizar cualquier usuario que tenga el rol MECHANIC a USER
UPDATE "users" SET "role" = 'USER' WHERE "role" = 'MECHANIC';

-- Crear un nuevo enum sin MECHANIC
CREATE TYPE "Role_new" AS ENUM ('USER', 'ADMIN');

-- Actualizar la tabla users para usar el nuevo enum
ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'USER';

-- Eliminar el enum antiguo
DROP TYPE "Role";

-- Renombrar el nuevo enum
ALTER TYPE "Role_new" RENAME TO "Role";
