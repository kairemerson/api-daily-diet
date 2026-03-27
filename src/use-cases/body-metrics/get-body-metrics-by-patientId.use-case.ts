import { AppError } from "../../errors/app-error";
import { prisma } from "../../lib/prisma";
import { BodyMetricsRepository } from "../../repositories/body-metrics-repository.interface";


export class GetBodyMetricsByPatientIdUseCase {
    constructor(private bodyMetricsRepository: BodyMetricsRepository){}

    async execute(input: {patientId: string, adminUserId: string}){
        const admin = await prisma.user.findUnique({
            where: {id: input.adminUserId},
            include: {nutritionistProfile: true}
        })

        if(!admin || admin.role !== "ADMIN") {
            throw new AppError("Somente ADMIN pode buscar métricas do paciente!")
        }

        if(!admin.nutritionistProfile) {
            throw new AppError("Perfil do nutricionista não encontrado!")
        }

        const patient = await prisma.patientProfile.findFirst({
            where: {
                id: input.patientId,
                nutritionistId: admin.nutritionistProfile.id,
            },
        })

        if (!patient) {
            throw new AppError("Paciente não pertence ao Nutricionista!")
        }

        const metrics = await this.bodyMetricsRepository.findByPatientId(input.patientId)

        const first = metrics[0]
        const last = metrics[metrics.length -1]

        return {
            currentWeight: last.weight ?? null,
            initialWeight: first.weight ?? null,
            weightDifference:
            first?.weight && last?.weight
                ? last.weight - first.weight
                : null,
            currentBodyFat: last.bodyFat ?? null,
            currentMuscleMass: last.muscleMass ?? null
        }
    }
}