import { prisma } from "../lib/prisma"
import { CreateMealPlanDTO, MealPlanRepository, UpdateMealPlan } from "./meal-plan-repository.interface"

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

  async findByPatientId(patientId: string) {
    const mealPlans = await prisma.mealPlan.findMany({
      where: {
        patientId,
      },
      include: {
        mealPlanItems: {
          orderBy: {
            time: "asc"
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    return mealPlans.map((plan) => {
      return {
        mealPlan: {
          id: plan.id,
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
          patientId: plan.patientId,
        },
        mealPlanItems: plan.mealPlanItems.map((item) => ({
          id: item.id,
          name: item.name,
          createdAt: item.createdAt,
          description: item.description,
          time: item.time,
          mealPlanId: item.mealPlanId,
          order: item.order,
          targetCalories: item.targetCalories,
          targetProtein: item.targetProtein,
          targetCarbs: item.targetCarbs,
          targetFat: item.targetFat,
        })),
      };
    });
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
      mealPlan: {
        id: plan.id,
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
        patientId: plan.patientId,
      },
      mealPlanItems: plan.mealPlanItems.map((item) => ({
        id: item.id,
        name: item.name,
        createdAt: item.createdAt,
        description: item.description,
        time: item.time,
        mealPlanId: item.mealPlanId,
        order: item.order,
        targetCalories: item.targetCalories,
        targetProtein: item.targetProtein,
        targetCarbs: item.targetCarbs,
        targetFat: item.targetFat,
      })),
    };
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