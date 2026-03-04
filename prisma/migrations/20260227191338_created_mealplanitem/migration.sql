/*
  Warnings:

  - You are about to drop the column `user_id` on the `meals` table. All the data in the column will be lost.
  - Made the column `patientProfileId` on table `meals` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "meals" DROP CONSTRAINT "meals_patientProfileId_fkey";

-- DropForeignKey
ALTER TABLE "meals" DROP CONSTRAINT "meals_user_id_fkey";

-- DropIndex
DROP INDEX "body_metrics_patientId_idx";

-- DropIndex
DROP INDEX "meals_user_id_date_idx";

-- DropIndex
DROP INDEX "meals_user_id_idx";

-- DropIndex
DROP INDEX "meals_user_id_is_on_diet_idx";

-- AlterTable
ALTER TABLE "meals" DROP COLUMN "user_id",
ADD COLUMN     "calories" INTEGER,
ADD COLUMN     "carbs" DOUBLE PRECISION,
ADD COLUMN     "fat" DOUBLE PRECISION,
ADD COLUMN     "mealPlanItemId" TEXT,
ADD COLUMN     "protein" DOUBLE PRECISION,
ALTER COLUMN "patientProfileId" SET NOT NULL;

-- CreateTable
CREATE TABLE "meal_plan_items" (
    "id" TEXT NOT NULL,
    "mealPlanId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "time" TEXT NOT NULL,
    "calories" INTEGER,
    "protein" DOUBLE PRECISION,
    "carbs" DOUBLE PRECISION,
    "fat" DOUBLE PRECISION,

    CONSTRAINT "meal_plan_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "meal_plan_items_mealPlanId_idx" ON "meal_plan_items"("mealPlanId");

-- CreateIndex
CREATE INDEX "body_metrics_patientId_recordedAt_idx" ON "body_metrics"("patientId", "recordedAt");

-- CreateIndex
CREATE INDEX "meal_plans_patientId_isActive_idx" ON "meal_plans"("patientId", "isActive");

-- CreateIndex
CREATE INDEX "meals_patientProfileId_idx" ON "meals"("patientProfileId");

-- CreateIndex
CREATE INDEX "meals_patientProfileId_date_idx" ON "meals"("patientProfileId", "date");

-- CreateIndex
CREATE INDEX "meals_patientProfileId_is_on_diet_idx" ON "meals"("patientProfileId", "is_on_diet");

-- AddForeignKey
ALTER TABLE "meal_plan_items" ADD CONSTRAINT "meal_plan_items_mealPlanId_fkey" FOREIGN KEY ("mealPlanId") REFERENCES "meal_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meals" ADD CONSTRAINT "meals_patientProfileId_fkey" FOREIGN KEY ("patientProfileId") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meals" ADD CONSTRAINT "meals_mealPlanItemId_fkey" FOREIGN KEY ("mealPlanItemId") REFERENCES "meal_plan_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;
