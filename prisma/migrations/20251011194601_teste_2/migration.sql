/*
  Warnings:

  - You are about to drop the `_AdminToDenuncia` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `resolvidoPor` on table `denuncias` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "_AdminToDenuncia" DROP CONSTRAINT "_AdminToDenuncia_A_fkey";

-- DropForeignKey
ALTER TABLE "_AdminToDenuncia" DROP CONSTRAINT "_AdminToDenuncia_B_fkey";

-- AlterTable
ALTER TABLE "denuncias" ALTER COLUMN "resolvidoPor" SET NOT NULL,
ALTER COLUMN "resolvidoPor" SET DATA TYPE TEXT;

-- DropTable
DROP TABLE "_AdminToDenuncia";

-- AddForeignKey
ALTER TABLE "denuncias" ADD CONSTRAINT "denuncias_resolvidoPor_fkey" FOREIGN KEY ("resolvidoPor") REFERENCES "admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
