import { PatientStatus } from "@prisma/client";
import { PatientRepository } from "../../repositories/patient-repository.interface";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../errors/app-error";

export interface UpdatePatientStatusRequest {
  adminUserId: string
  patientId: string
  status: PatientStatus
}

export class UpdatePatientStatusUseCase {
    constructor(private patientRepository: PatientRepository){}

    async execute(input: UpdatePatientStatusRequest): Promise<void> {
        const admin = await prisma.user.findUnique({
            where: { id: input.adminUserId },
            include: { nutritionistProfile: true }
        })

        if (!admin || admin.role !== "ADMIN") {
            throw new AppError("Apenas ADMIN pode acessar dashboard.")
        }

        if (!admin.nutritionistProfile) {
            throw new AppError("Perfil do nutricionista não encontrado.")
        }

        const patient = await prisma.patientProfile.findFirst({
            where: {
                id: input.patientId,
                nutritionistId: admin.nutritionistProfile.id
            },
        })

        if (!patient) {
            throw new AppError("Paciente não pertence ao nutricionista.")
        }

        await this.patientRepository.updatePatientStatus(input.patientId, input.status)
    }
}