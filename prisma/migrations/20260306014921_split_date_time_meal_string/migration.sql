/*
  Warnings:

  - Added the required column `date` to the `meals` table without a default value. This is not possible if the table is not empty.
  - Added the required column `time` to the `meals` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "meal_plan_items" ALTER COLUMN "time" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "meals" ADD COLUMN     "date" TEXT NOT NULL,
ADD COLUMN     "time" TEXT NOT NULL;
