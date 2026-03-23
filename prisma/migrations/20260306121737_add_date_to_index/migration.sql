-- DropIndex
DROP INDEX "meals_patientProfileId_idx";

-- CreateIndex
CREATE INDEX "meals_patientProfileId_date_idx" ON "meals"("patientProfileId", "date");
