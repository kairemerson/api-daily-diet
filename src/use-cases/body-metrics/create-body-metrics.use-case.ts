import { AppError } from "../../errors/app-error";
import { prisma } from "../../lib/prisma";
import { BodyMetricsRepository } from "../../repositories/body-metrics-repository.interface";

interface CreateBodyMetricsRequest {
    adminUserId: string
    patientId: string
    weight?: number
    bodyFat?: number
    muscleMass?: number  
    recordedAt?: Date
}

export class CreateBodyMetricsUseCase {
    constructor(private bodyMetricsRepository: BodyMetricsRepository){}

    async execute(data: CreateBodyMetricsRequest) {
        const admin = await prisma.user.findUnique({
            where: {id: data.adminUserId},
            include: {nutritionistProfile: true}
        })

        if(!admin || admin.role !== "ADMIN") {
            throw new AppError("Somente ADMIN pode criar plano alimentar!")
        }

        if(!admin.nutritionistProfile) {
            throw new AppError("Perfil do nutricionista não encontrado!")
        }

        const patient = await prisma.patientProfile.findFirst({
            where: {
                id: data.patientId,
                nutritionistId: admin.nutritionistProfile.id,
            },
        })

        if (!patient) {
            throw new AppError("Paciente não pertence ao Nutricionista!")
        }

        return this.bodyMetricsRepository.create({
            patientId: patient.id,
            weight: data.weight,
            bodyFat: data.bodyFat,
            muscleMass: data.muscleMass,
            recordedAt: data.recordedAt ?? new Date(),
        })
    }
}