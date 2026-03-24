import { AppError } from "../errors/app-error";
import { prisma } from "../lib/prisma";
import { MealPLanItemRepository } from "../repositories/meal-plan-item.respository";

interface CreateRequest {
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

export class MealPlanItemService {
    constructor(private mealPlanItemRepository: MealPLanItemRepository){}

    async create(data: CreateRequest) {
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

    async getMealPlanItemByIdRequest(mealPlanItemId: string, userId: string) {
        const patient = await prisma.patientProfile.findUnique({
            where: {
                userId
            }
        })

        const mealPlanItem = await prisma.mealPlanItem.findUnique({
            where: {
                id: mealPlanItemId,
            },
            include: {
                mealPlan: {
                    select: {
                        patientId: true
                    }
                }
            }
        })

        if(patient?.id !== mealPlanItem?.mealPlan.patientId) {
            throw new AppError("Este plano não pertence ao paciente!")

        }

        return this.mealPlanItemRepository.findMealPlanItemById(mealPlanItemId)
    }
}