

import { prisma } from "@/lib/prisma"

interface CreateMealPlanData {
  patientId: string
  title: string
  description?: string
  caloriesTarget?: number
  proteinTarget?: number
  carbsTarget?: number
  fatTarget?: number
  startDate: Date
  endDate?: Date
}

export class MealPlanRepository {
  async create(data: CreateMealPlanData) {
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
    return prisma.mealPlan.findMany({
      where: {
        patientId,
      },
      include: {
        meals: {
          orderBy: {
            time: "asc"
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    })
  }
}