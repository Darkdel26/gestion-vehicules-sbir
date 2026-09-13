/*
  Warnings:

  - Added the required column `vehiculeId` to the `Demande` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Demande" ADD COLUMN     "vehiculeId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Demande" ADD CONSTRAINT "Demande_vehiculeId_fkey" FOREIGN KEY ("vehiculeId") REFERENCES "Vehicule"("id") ON DELETE CASCADE ON UPDATE CASCADE;
