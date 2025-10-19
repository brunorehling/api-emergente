/*
  Warnings:

  - Made the column `usuarioId` on table `review` required. This step will fail if there are existing NULL values in that column.
  - Made the column `livros_id` on table `review` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "review" DROP CONSTRAINT "review_livros_id_fkey";

-- DropForeignKey
ALTER TABLE "review" DROP CONSTRAINT "review_usuarioId_fkey";

-- AlterTable
ALTER TABLE "review" ALTER COLUMN "usuarioId" SET NOT NULL,
ALTER COLUMN "livros_id" SET NOT NULL;

UPDATE "review" 
SET "usuarioId" = 1, "livros_id" = 2
WHERE "usuarioId" IS NULL OR "livros_id" IS NULL;

-- AddForeignKey
ALTER TABLE "review" ADD CONSTRAINT "review_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review" ADD CONSTRAINT "review_livros_id_fkey" FOREIGN KEY ("livros_id") REFERENCES "livros"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
