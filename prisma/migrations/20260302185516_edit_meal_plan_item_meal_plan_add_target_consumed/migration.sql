/*
  Warnings:

  - You are about to drop the column `calories` on the `meal_plan_items` table. All the data in the column will be lost.
  - You are about to drop the column `carbs` on the `meal_plan_items` table. All the data in the column will be lost.
  - You are about to drop the column `fat` on the `meal_plan_items` table. All the data in the column will be lost.
  - You are about to drop the column `protein` on the `meal_plan_items` table. All the data in the column will be lost.
  - You are about to drop the column `calories` on the `meals` table. All the data in the column will be lost.
  - You are about to drop the column `carbs` on the `meals` table. All the data in the column will be lost.
  - You are about to drop the column `fat` on the `meals` table. All the data in the column will be lost.
  - You are about to drop the column `protein` on the `meals` table. All the data in the column will be lost.
  - Added the required column `order` to the `meal_plan_items` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `time` on the `meal_plan_items` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "meal_plan_items" DROP COLUMN "calories",
DROP COLUMN "carbs",
DROP COLUMN "fat",
DROP COLUMN "protein",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "order" INTEGER NOT NULL,
ADD COLUMN     "targetCalories" INTEGER,
ADD COLUMN     "targetCarbs" DOUBLE PRECISION,
ADD COLUMN     "targetFat" DOUBLE PRECISION,
ADD COLUMN     "targetProtein" DOUBLE PRECISION,
DROP COLUMN "time",
ADD COLUMN     "time" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "meals" DROP COLUMN "calories",
DROP COLUMN "carbs",
DROP COLUMN "fat",
DROP COLUMN "protein",
ADD COLUMN     "consumedCalories" INTEGER,
ADD COLUMN     "consumedCarbs" DOUBLE PRECISION,
ADD COLUMN     "consumedFat" DOUBLE PRECISION,
ADD COLUMN     "consumedProtein" DOUBLE PRECISION;
