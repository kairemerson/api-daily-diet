import { AppError } from "../../errors/app-error";
import { prisma } from "../../lib/prisma";
import { MealPLanItemRepository } from "../../repositories/meal-plan-item-repository.interface";

interface CreateMealPLanItemRequest {
    adminUserId: string
    mealPlanId: string
    name: string
    description?: string
    order: number
    time: string
    targetCalories?: number
    targetProtein?: number
    targetCarbs?: number
    targetFat?: number
}

export class CreateMealPlanItemUseCase {
    constructor(private mealPlanItemRepository: MealPLanItemRepository){}

    async execute(data: CreateMealPLanItemRequest) {
        const admin = await prisma.user.findUnique({
            where: { id: data.adminUserId },
            include: { nutritionistProfile: true },
        })

        if (!admin || admin.role !== "ADMIN") {
            throw new AppError("Somente ADMIN pode criar refeições do plano!")
        }

        if (!admin.nutritionistProfile) {
            throw new AppError("Perfil do nutricionista não encontrado!")
        }

        const mealPlan = await prisma.mealPlan.findUnique({
            where: { id: data.mealPlanId },
                include: {
                patient: true,
            },
        })

        if (!mealPlan) {
            throw new AppError("Plano alimentar não encontrado!")
        }

        if (mealPlan.patient.nutritionistId !== admin.nutritionistProfile.id) {
            throw new AppError("Este plano não pertence a um paciente seu!")
        }
        
        return this.mealPlanItemRepository.create(data)
    }
}