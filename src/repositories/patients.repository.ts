import { dateToLocalString } from "../helpers/build-dates"
import { prisma } from "../lib/prisma"
import { PatientStatus } from "@prisma/client"

interface CreatePatientData {
  user: {
    name: string
    email: string
    password: string
  }
  profile: {
    nutritionistId: string
    goal: "WEIGHT_LOSS" | "HYPERTROPHY" | "REEDUCATION" | "MAINTENANCE"
    birthDate?: Date
    height?: number
    targetWeight?: number
    observation?: string
  }
}

export class PatientRepository {
    async create(data: CreatePatientData) {
        return prisma.$transaction(async (tx) => {
          const user = await tx.user.create({
            data: {
              name: data.user.name,
              email: data.user.email,
              password: data.user.password,
              role: "PATIENT"
            }
          })

          const profile = await tx.patientProfile.create({
            data: {
              userId: user.id,
              nutritionistId: data.profile.nutritionistId,
              goal: data.profile.goal,
              birthDate: data.profile.birthDate,
              height: data.profile.height,
              targetWeight: data.profile.targetWeight,
              observation: data.profile.observation
            }
          })

          return {user, profile}
        })
    }

    async findManyWithAdherenceByNutritionistId(nutritionistId: string) {
      //Buscar pacientes
      const patients = await prisma.patientProfile.findMany({
        where: { nutritionistId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          mealPlans: {
            where: { isActive: true },
            select: { id: true },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      })

      const patientIds = patients.map(p => p.id)

      if (patientIds.length === 0) {
        return {
          patients: [],
          mealStats: [],
          lastActivity: []
        }
      }

      // Buscar refeições pelo periodo
      const thirdDaysAgo = new Date()
      thirdDaysAgo.setHours(0,0,0,0)
      thirdDaysAgo.setDate(thirdDaysAgo.getDate() - 30)

      const thirdDaysAgoStr = dateToLocalString(thirdDaysAgo)

      const mealStats = await prisma.meal.groupBy({
        by: ["patientProfileId", "isOnDiet"],
        where: {
          patientProfileId: { in: patientIds },
          date: {
            gte: thirdDaysAgoStr
          },
          
        },
        _count: true,
      })

      //Buscar última atividade
      const lastActivity = await prisma.meal.groupBy({
        by: ["patientProfileId"],
        where: {
          patientProfileId: { in: patientIds },
          mealPlanItem: {
            mealPlan: {
              isActive: true,
            },
          },
        },
        _max: {
          dateTime: true,
        },
      })
      
      return {
        patients,
        mealStats,
        lastActivity,
      }
    }

    async updatePatientStatus(patientId: string, status: PatientStatus) {
      await prisma.patientProfile.update({
        where: {id: patientId},
        data: {status}
      })
    }

}