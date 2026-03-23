import { AppError } from "@/errors/app-error"
import { prisma } from "@/lib/prisma"
import { BodyMetricsRepository } from "@/repositories/body-metrics.repository"

interface CreateRequest {
    adminUserId: string
    patientId: string
    weight?: number
    bodyFat?: number
    muscleMass?: number  
    recordedAt?: Date
}

export class BodyMetricsService {
    constructor(private bodyMetricsRepository: BodyMetricsRepository){}

    async create(data: CreateRequest) {
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

        //removendo adminUserId antes de enviar
        const { adminUserId, ...bodyMetricsData } = data

        return this.bodyMetricsRepository.create({
            patientId: patient.id,
            weight: data.weight,
            bodyFat: data.bodyFat,
            muscleMass: data.muscleMass,
            recordedAt: data.recordedAt ?? new Date(),
        })
    }

    async fetchByPatientId(patientId: string, adminUserId: string) {
        const admin = await prisma.user.findUnique({
            where: {id: adminUserId},
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
                id: patientId,
                nutritionistId: admin.nutritionistProfile.id,
            },
        })

        if (!patient) {
            throw new AppError("Paciente não pertence ao Nutricionista!")
        }

        const metrics = await this.bodyMetricsRepository.findByPatientId(patientId)

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