import { prisma } from "../lib/prisma";

interface CreateMealPlanItemData {
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

export class MealPLanItemRepository {
    async create(data: CreateMealPlanItemData) {

        
        
        return prisma.mealPlanItem.create({
            data: {
                mealPlanId: data.mealPlanId,
                name: data.name.trim(),
                description: data.description?.trim(),
                order: data.order,
                time: data.time,
                targetCalories: data.targetCalories,
                targetProtein: data.targetProtein,
                targetCarbs: data.targetCarbs,
                targetFat: data.targetFat,
            }
        })
    }

    async findMealPlanItemById(mealPlanItemId: string) {
        return prisma.mealPlanItem.findUnique({
            where: {
                id: mealPlanItemId
            }
        })
    }
}