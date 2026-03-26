import { prisma } from "../lib/prisma"
import { CreateMealPlanDTO, MealPlanRepository, MealPlanWithMealPlanItems, UpdateMealPlan } from "./meal-plan-repository.interface"

export class PrismaMealPlanRepository implements MealPlanRepository {
  async create(data: CreateMealPlanDTO) {
    return prisma.mealPlan.create({
      data: {
        patientId: data.patientId,
        title: data.title,
        description: data.description,
        caloriesTarget: data.caloriesTarget,
        proteinTarget: data.proteinTarget,
        carbsTarget: data.carbsTarget,
        fatTarget: data.fatTarget,
        startDate: data.startDate,
        endDate: data.endDate,
      },
    })
  }

  async findByPatientId(patientId: string): Promise<MealPlanWithMealPlanItems[]> {
    const mealPlans = await prisma.mealPlan.findMany({
        where: { patientId },
        include: {
            mealPlanItems: {
                orderBy: { time: "asc" }
            }
        },
        orderBy: { createdAt: "desc" }
    })

    return mealPlans.map((plan) => ({
        id: plan.id,
        patientId: plan.patientId,
        title: plan.title,
        description: plan.description,
        caloriesTarget: plan.caloriesTarget,
        proteinTarget: plan.proteinTarget,
        carbsTarget: plan.carbsTarget,
        fatTarget: plan.fatTarget,
        startDate: plan.startDate,
        endDate: plan.endDate,
        isActive: plan.isActive,
        createdAt: plan.createdAt,
        updatedAt: plan.updatedAt,
        mealPlanItems: plan.mealPlanItems.map((item) => ({
            id: item.id,
            description: item.description,
            name: item.name,
            targetCalories: item.targetCalories,
            targetProtein: item.targetProtein,
            targetCarbs: item.targetCarbs,
            targetFat: item.targetFat,
            mealPlanId: item.mealPlanId,
            time: item.time,
        }))
    }))
}

  async findById(mealPlanId: string) {
    const plan = await prisma.mealPlan.findUnique({
      where: { id: mealPlanId },
      include: {
        mealPlanItems: {
          orderBy: { time: "asc" },
        },
      },
    });

    if (!plan) throw new Error("MealPlan not found");

    return {
        id: plan.id,
        patientId: plan.patientId,
        title: plan.title,
        description: plan.description,
        caloriesTarget: plan.caloriesTarget,
        proteinTarget: plan.proteinTarget,
        carbsTarget: plan.carbsTarget,
        fatTarget: plan.fatTarget,
        startDate: plan.startDate,
        endDate: plan.endDate,
        isActive: plan.isActive,
        createdAt: plan.createdAt,
        updatedAt: plan.updatedAt,
        mealPlanItems: plan.mealPlanItems.map((item) => ({
            id: item.id,
            description: item.description,
            name: item.name,
            targetCalories: item.targetCalories,
            targetProtein: item.targetProtein,
            targetCarbs: item.targetCarbs,
            targetFat: item.targetFat,
            mealPlanId: item.mealPlanId,
            time: item.time,
        }))
    }
  }

  async update(mealPlanId: string, data: UpdateMealPlan) {
    return prisma.mealPlan.update({
      where: {
        id: mealPlanId
      },
      data: {
        title: data.title,
        description: data.description,
        caloriesTarget: data.caloriesTarget,
        proteinTarget: data.proteinTarget,
        carbsTarget: data.carbsTarget,
        fatTarget: data.fatTarget,
        startDate: data.startDate,
        endDate: data.endDate,
      }
    })
  }
}