import { prisma } from "../lib/prisma";
import { CreateMealPlanItemDTO, MealPLanItemRepository } from "./meal-plan-item-repository.interface";

export class PrismaMealPLanItemRepository implements MealPLanItemRepository {
    async create(data: CreateMealPlanItemDTO) {

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