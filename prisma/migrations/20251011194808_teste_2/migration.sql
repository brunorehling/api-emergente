-- DropForeignKey
ALTER TABLE "denuncias" DROP CONSTRAINT "denuncias_resolvidoPor_fkey";

-- AlterTable
ALTER TABLE "denuncias" ALTER COLUMN "resolvidoPor" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "denuncias" ADD CONSTRAINT "denuncias_resolvidoPor_fkey" FOREIGN KEY ("resolvidoPor") REFERENCES "admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;
