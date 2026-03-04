import { AppError } from "@/errors/app-error";
import { prisma } from "@/lib/prisma";
import { MealPlanRepository } from "@/repositories/mealPlan.repository";

interface CreateRequest {
    adminUserId: string
    patientId: string
    title: string
    description?: string
    caloriesTarget?: number
    proteinTarget?: number
    carbsTarget?: number
    fatTarget?: number
    startDate: Date
    endDate?:   Date
}

interface FindByPatientIdRequest {
  adminUserId: string
  patientId: string
}

export class MealPlanService {
    constructor(private mealPlanRepository: MealPlanRepository){}

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

        return this.mealPlanRepository.create(data)
    }

    async findByPatientId({adminUserId, patientId}: FindByPatientIdRequest) {
        const admin = await prisma.user.findUnique({
            where: {id: adminUserId},
            include: {nutritionistProfile: true}
        })

        if(!admin || admin.role !== "ADMIN") {
            throw new AppError("Somente ADMIN pode visualizar planos!")
        }

        if(!admin.nutritionistProfile) {
            throw new AppError("Perfil do nutricionista não encontrado!")
        }

        const patient = await prisma.patientProfile.findFirst({
            where: {
                id: patientId,
                nutritionistId: admin.nutritionistProfile.id
            }
        })

        if (!patient) {
            throw new AppError("Paciente não pertence ao Nutricionista!")
        }

        return this.mealPlanRepository.findByPatientId(patientId)
    }

}