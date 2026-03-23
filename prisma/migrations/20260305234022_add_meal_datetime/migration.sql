/*
  Warnings:

  - You are about to drop the column `date` on the `meals` table. All the data in the column will be lost.
  - You are about to drop the column `time` on the `meals` table. All the data in the column will be lost.
  - Added the required column `dateTime` to the `meals` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "meals_patientProfileId_date_idx";

-- AlterTable
ALTER TABLE "meals" DROP COLUMN "date",
DROP COLUMN "time",
ADD COLUMN     "dateTime" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE INDEX "meals_patientProfileId_dateTime_idx" ON "meals"("patientProfileId", "dateTime");
