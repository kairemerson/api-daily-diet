/*
  Warnings:

  - You are about to drop the column `bodyFat` on the `patients` table. All the data in the column will be lost.
  - You are about to drop the column `muscleMass` on the `patients` table. All the data in the column will be lost.
  - You are about to drop the column `weight` on the `patients` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "patients" DROP COLUMN "bodyFat",
DROP COLUMN "muscleMass",
DROP COLUMN "weight";
