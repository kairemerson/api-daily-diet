import { AppError } from "@/errors/app-error";
import { prisma } from "@/lib/prisma";
import { PatientRepository } from "@/repositories/patients.repository";
import bcrypt from "bcryptjs"


interface CreateDataRequest {
  adminUserId: string
  name: string
  email: string
  password: string
  goal: "WEIGHT_LOSS" | "HYPERTROPHY" | "REEDUCATION" | "MAINTENANCE"
  birthDate?: Date
  height?: number
  targetWeight?: number
  observation?: string
}

interface GetDashboardRequest {
  adminUserId: string
  patientId: string
}

export class PatientProfileService {
    constructor(private patientsRepository: PatientRepository){}

    async execute(data: CreateDataRequest){
        const admin = await prisma.user.findUnique({
            where: {id: data.adminUserId},
            include: {nutritionistProfile: true}
        })

        if(!admin || admin.role !== "ADMIN") {
            throw new AppError("Somente ADMIN pode criar pacientes!")
        }

        if(!admin.nutritionistProfile) {
            throw new AppError("Perfil do nutricionista não encontrado!")
        }
        
        const hashedPassword = await bcrypt.hash(data.password, 8)
        
        return this.patientsRepository.create({
            user: {
                name: data.name,
                email: data.email,
                password: hashedPassword
            },
            profile: {
                nutritionistId: admin.nutritionistProfile.id,
                goal: data.goal,
                birthDate: data.birthDate,
                height: data.height,
                targetWeight: data.targetWeight,
                observation: data.observation
            }
        })
    }

    async listByUser(userId: string){
        const user = await prisma.user.findUnique({
            where: {id: userId},
            include: {nutritionistProfile: true}
        })

        if(!user || user.role !== "ADMIN") {
            throw new AppError("Somente ADMIN pode buscar pacientes!")
        }

        if(!user.nutritionistProfile) {
            throw new AppError("Perfil do nutricionista não encontrado!")
        }

        const data = await this.patientsRepository.findManyWithAdherenceByNutritionistId(
            user.nutritionistProfile.id
        )

        const { patients, mealStats, lastActivity } = data

        return patients.map((patient) => {
            // filtrar stats do paciente
            const stats = mealStats.filter(
                s => s.patientProfileId === patient.id
            )

            const totalMeals = stats.reduce(
                (acc, curr) => acc + curr._count,
                0
            )

            const onDietMeals =
            stats.find(s => s.isOnDiet === true)?._count ?? 0

            const adherence =
            totalMeals === 0
                ? 0
                : Number(((onDietMeals / totalMeals) * 100).toFixed(0))

            const last =
            lastActivity.find(
                l => l.patientProfileId === patient.id
            )?._max.createdAt ?? null
       

            return {
                id: patient.id,
                name: patient.user.name,
                email: patient.user.email,
                lastActivity,
                adherence,
                totalMeals,
            }
        })

    }

    async getDashboard({adminUserId, patientId}: GetDashboardRequest){

        const admin = await prisma.user.findUnique({
            where: { id: adminUserId },
            include: { nutritionistProfile: true }
        })

        if (!admin || admin.role !== "ADMIN") {
            throw new AppError("Apenas ADMIN pode acessar dashboard.")
        }

        if (!admin.nutritionistProfile) {
            throw new AppError("Perfil do nutricionista não encontrado.")
        }

        const patient = await prisma.patientProfile.findFirst({
            where: {
                id: patientId,
                nutritionistId: admin.nutritionistProfile.id
            },
            include: {
                user: true
            }
        })

        if (!patient) {
            throw new AppError("Paciente não pertence ao nutricionista.")
        }

        //Buscar métricas corporais
        const bodyMetrics = await prisma.bodyMetrics.findMany({
            where: { patientId },
            orderBy: { recordedAt: "asc" }
        })

        const firstMetric = bodyMetrics[0]
        const lastMetric = bodyMetrics[bodyMetrics.length - 1]

        const currentWeight = lastMetric?.weight ?? null
        const weightDifference =
            firstMetric?.weight && lastMetric?.weight
                ? lastMetric.weight - firstMetric.weight
                : null

        const currentBodyFat = lastMetric?.bodyFat ?? null
        const currentMuscleMass = lastMetric?.muscleMass ?? null

        // Buscar plano ativo
        const activeMealPlan = await prisma.mealPlan.findFirst({
            where: {
                patientId,
                isActive: true
            },
            include: {
                meals: true
            }
        })

        // Calcular aderência últimos 7 dias
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

        const mealsLast7Days = await prisma.meal.findMany({
            where: {
                patientProfileId: patientId,
                date: { gte: sevenDaysAgo }
            }
        })

        const totalMeals = mealsLast7Days.length
        const onDietMeals = mealsLast7Days.filter(m => m.isOnDiet).length

        const adherence =
        totalMeals > 0
            ? Math.round((onDietMeals / totalMeals) * 100)
            : 0

        return {
            patient: {
                id: patient.id,
                name: patient.user.name,
                goal: patient.goal,
                targetWeight: patient.targetWeight,
                observation: patient.observation
            },
            metrics: {
                currentWeight,
                weightDifference,
                currentBodyFat,
                currentMuscleMass
            },
            adherence: {
                last7Days: adherence
            },
            activeMealPlan
        }
    }

    async getPatientDashboard({userId}: {userId: string}){

        const patient = await prisma.patientProfile.findUnique({
            where: {
                userId: userId,
            },
            include: {
                user: true
            }
        })

        if (!patient) {
            throw new AppError("Paciente não encontrado.")
        }

        //Buscar métricas corporais
        const bodyMetrics = await prisma.bodyMetrics.findMany({
            where: { patientId: patient.id },
            orderBy: { recordedAt: "asc" }
        })

        const firstMetric = bodyMetrics[0]
        const lastMetric = bodyMetrics[bodyMetrics.length - 1]

        const currentWeight = lastMetric?.weight ?? null
        const weightDifference =
            firstMetric?.weight && lastMetric?.weight
                ? lastMetric.weight - firstMetric.weight
                : null

        const currentBodyFat = lastMetric?.bodyFat ?? null
        const currentMuscleMass = lastMetric?.muscleMass ?? null

        // Buscar plano ativo
        const activeMealPlan = await prisma.mealPlan.findFirst({
            where: {
                patientId: patient.id,
                isActive: true
            },
            include: {
                meals: true
            }
        })

        // Calcular aderência últimos 7 dias
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

        
        const mealsLast7Days = await prisma.meal.findMany({
            where: {
                patientProfileId: patient.id,
                date: { gte: sevenDaysAgo }
            }
        })

        const totalMeals = mealsLast7Days.length
        const onDietMeals = mealsLast7Days.filter(m => m.isOnDiet).length
        
        const adherence =
            totalMeals > 0
            ? Math.round((onDietMeals / totalMeals) * 100)
            : 0

        //Calcular today
        const startOfToday = new Date()
        startOfToday.setHours(0, 0, 0, 0)

        const endOfToday = new Date()
        endOfToday.setHours(23, 59, 59, 999)
        
        const mealsToday = await prisma.meal.findMany({
            where: {
                patientProfileId: patient.id,
                date: {
                    gte: startOfToday,
                    lte: endOfToday
                }
            }
        })

        const totalTodayMeals = activeMealPlan?.meals.length ?? 0
        const completedMealsToday = mealsToday.length

        const totalCaloriesConsumed = mealsToday.reduce(
            (sum, meal) => sum + (meal.consumedCalories ?? 0),
            0
        )
        const totalCaloriesTarget = activeMealPlan?.caloriesTarget ?? 0

        const onDietToday = mealsToday.filter((meal) => meal.isOnDiet).length
        const adherenceToday = completedMealsToday > 0 ? Math.round((onDietToday / completedMealsToday) * 100) : 0

        return {
            patient: {
                id: patient.id,
                name: patient.user.name,
                goal: patient.goal,
                targetWeight: patient.targetWeight,
                observation: patient.observation
            },
            metrics: {
                currentWeight,
                weightDifference,
                currentBodyFat,
                currentMuscleMass
            },
            adherence: {
                last7Days: adherence
            },
            today: {
                totalTodayMeals,
                completedMealsToday,
                totalCaloriesTarget,
                totalCaloriesConsumed,
                adherenceToday
            },
            activeMealPlan
        }
    }
}