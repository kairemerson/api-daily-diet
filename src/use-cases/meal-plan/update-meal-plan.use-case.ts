import { AppError } from "../../errors/app-error";
import { prisma } from "../../lib/prisma";
import { MealPlanRepository } from "../../repositories/meal-plan-repository.interface";

interface UpdateMealPlanRequest {
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

export class UpdateMealPlanUseCase {
    constructor(private mealPlanRepository: MealPlanRepository){}

    async execute(adminUserId: string, mealPlanId: string, data: UpdateMealPlanRequest) {
        const admin = await prisma.user.findUnique({
            where: {id: adminUserId},
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

        return this.mealPlanRepository.update(mealPlanId, data)
    }
}