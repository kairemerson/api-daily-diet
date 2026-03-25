import { PatientStatus } from "@prisma/client";
import { AppError } from "../errors/app-error";
import { dateToLocalString, getLocalDateString } from "../helpers/build-dates";
import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs"
import { PatientRepository } from "../repositories/patient-repository.interface";


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

interface UpdatePatientStatusRequest {
  adminUserId: string
  patientId: string
  status: PatientStatus
}

export class PatientProfileService {
    constructor(private patientRepository: PatientRepository){}

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
        
        return this.patientRepository.create({
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

    async listByUser(userId: string) {

        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { nutritionistProfile: true }
        })

        if (!user || user.role !== "ADMIN") {
            throw new AppError("Somente ADMIN pode buscar pacientes!")
        }

        if (!user.nutritionistProfile) {
            throw new AppError("Perfil do nutricionista não encontrado!")
        }

        const { patients, mealStats, lastActivity } =
            await this.patientRepository.findManyWithAdherenceByNutritionistId(
                user.nutritionistProfile.id
            )

        // map de stats
        const statsByPatient = new Map<string, any[]>()

        for (const stat of mealStats) {
                if (!statsByPatient.has(stat.patientProfileId)) {
                statsByPatient.set(stat.patientProfileId, [])
            }

            statsByPatient.get(stat.patientProfileId)!.push(stat)
        }

        // map de última atividade
        const lastActivityByPatient = new Map<string, Date | null>()

        for (const activity of lastActivity) {
                lastActivityByPatient.set(
                activity.patientProfileId,
                activity._max.dateTime
            )
        }

        return patients.map((patient) => {

            const stats = statsByPatient.get(patient.id) ?? []

            const totalMeals = stats.reduce(
                (acc, curr) => acc + curr._count,
                0
            )

            const onDietMeals =
                stats.find(s => s.isOnDiet === true)?._count ?? 0
            
            const adherence =
                totalMeals === 0
                    ? 0
                    : Math.round((onDietMeals / totalMeals) * 100)

            const last = lastActivityByPatient.get(patient.id) ?? null
            
            return {
                id: patient.id,
                name: patient.user.name,
                email: patient.user.email,
                lastActivity: last,
                adherence,
                totalMeals
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
        const [firstMetric, lastMetric] = await Promise.all([
            prisma.bodyMetrics.findFirst({
                where: { patientId },
                orderBy: { recordedAt: "asc" }
            }),
            prisma.bodyMetrics.findFirst({
                where: { patientId },
                orderBy: { recordedAt: "desc" }
            })
        ])

        const currentWeight = lastMetric?.weight ?? null
        const weightDifference =
            firstMetric?.weight != null && lastMetric?.weight != null
                ? lastMetric.weight - firstMetric.weight
                : null

        const currentBodyFat = lastMetric?.bodyFat ?? null
        const currentMuscleMass = lastMetric?.muscleMass ?? null

        // Buscar plano alimentar
        const mealPlans = await prisma.mealPlan.findMany({
            where: {
                patientId,
            },
            include: {
                mealPlanItems: true
            }
        })

        // Calcular aderência últimos 7 dias
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setHours(0,0,0,0)
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

        const mealsLast7Days = await prisma.meal.findMany({
            where: {
                patientProfileId: patientId,
                dateTime: { gte: sevenDaysAgo },
                
            },
            select: {
                isOnDiet: true
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
                status: patient.status,
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
            mealPlans
        }
    }

    async getPatientDashboard({userId}: {userId: string}){
        
        const patient = await prisma.patientProfile.findUnique({
            where: {
                userId: userId,
            },
            select: {
                id: true,
                goal: true,
                targetWeight: true,
                observation: true,
                status: true,
                user: {
                    select: {name: true}
                }
            }
        })

        if (!patient) {
            throw new AppError("Paciente não encontrado.")
        }

        //Buscar métricas corporais
        const [firstMetric, lastMetric] = await Promise.all([
            prisma.bodyMetrics.findFirst({
                where: { patientId: patient.id },
                orderBy: { recordedAt: "asc" }
            }),
            prisma.bodyMetrics.findFirst({
                where: { patientId: patient.id },
                orderBy: { recordedAt: "desc" }
            })
        ])

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
            select: {
                id: true,
                caloriesTarget: true,
                mealPlanItems: {
                    select: {
                        id: true, 
                        name: true, 
                        order: true, 
                        time: true
                    }
                }
            }
        })

        // Calcular aderência últimos 7 dias
        const todayStr = getLocalDateString()

        const sevenDaysAgo = new Date()
        sevenDaysAgo.setHours(0,0,0,0)
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

        const sevenDaysAgoStr = dateToLocalString(sevenDaysAgo)

        const mealsLast7Days = await prisma.meal.findMany({
            where: {
                patientProfileId: patient.id,
                date: {
                    gte: sevenDaysAgoStr
                }
            },
            select: {
                isOnDiet: true
            }
        })

        const totalMeals = mealsLast7Days.length
        const onDietMeals = mealsLast7Days.filter(m => m.isOnDiet).length
        
        const adherence =
            totalMeals > 0
            ? Math.round((onDietMeals / totalMeals) * 100)
            : 0

        //Calcular today
        const mealsToday = await prisma.meal.findMany({
            where: {
                patientProfileId: patient.id,
                date: todayStr
            },
            select: {
                isOnDiet: true,
                consumedCalories: true,
                consumedProtein: true,
                consumedCarbs: true,
                consumedFat: true
            }
        })

        const totalTodayMeals = activeMealPlan?.mealPlanItems.length ?? 0
        const completedMealsToday = mealsToday.length

        const totalCaloriesTarget = activeMealPlan?.caloriesTarget ?? 0
        
        const onDietToday = mealsToday.filter((meal) => meal.isOnDiet).length
        const adherenceToday = completedMealsToday > 0 ? Math.round((onDietToday / completedMealsToday) * 100) : 0
        
        // Calcular totais consumed hoje
        const totalCaloriesConsumed = mealsToday.reduce(
            (sum, meal) => sum + (meal.consumedCalories ?? 0),
            0
        )
        const totalProteinConsumed = mealsToday.reduce(
            (sum, meal) => sum + (meal.consumedProtein ?? 0)
        , 0)
        const totalCarbsConsumed = mealsToday.reduce(
            (sum, meal) => sum + (meal.consumedCarbs ?? 0)
        , 0)
        const totalFatConsumed = mealsToday.reduce(
            (sum, meal) => sum + (meal.consumedFat ?? 0)
        , 0)

        // Calcular streak do dia no ultimo 90 dias
        const ninetyDaysAgo = new Date()
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)

        const ninetyDaysAgoStr = dateToLocalString(ninetyDaysAgo)

        const meals = await prisma.meal.findMany({
            where: {
                patientProfileId: patient.id,
                date: {
                    gte: ninetyDaysAgoStr
                }
            },
            select: {
                date: true,
                isOnDiet: true
            },
            orderBy: {
                date: "desc"
            }
        })

        const mealsByDay: Record<string, { isOnDiet: boolean }[]> = {}

        for (const meal of meals) {
            if (!mealsByDay[meal.date]) {
                mealsByDay[meal.date] = []
            }

            mealsByDay[meal.date].push(meal)
        }

        const todayDate = new Date()
        todayDate.setHours(0, 0, 0, 0)

        const days: string[] = []

        for (let i = 0; i < 90; i++) {
            const d = new Date(todayDate)
            d.setDate(todayDate.getDate() - i)

            days.push(dateToLocalString(d))
        }

        const dayStatus: Record<string, boolean> = {}

        for (const day in mealsByDay) {
            const dayMeals = mealsByDay[day]

            const hasMeals = dayMeals.length > 0
            const hasOffDiet = dayMeals.some(m => !m.isOnDiet)

            dayStatus[day] = hasMeals && !hasOffDiet
        }

        let bestStreak = 0
        let tempStreak = 0

        for (const day of days) {

            const isValidDay = dayStatus[day] === true

            if (isValidDay) {
                tempStreak++
                bestStreak = Math.max(bestStreak, tempStreak)
            } else {
                tempStreak = 0
            }

        }

        let currentStreak = 0

        for (let i = 0; i < days.length; i++) {

            const day = days[i]
            const isToday = i === 0
            const isValidDay = dayStatus[day]

            const hasMeals = mealsByDay[day]?.length > 0

            // hoje sem refeição não quebra
            if (isToday && !hasMeals) {
                continue
            }

            if (isValidDay) {
                currentStreak++
            } else {
                break
            }

        }
      

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
                currentMuscleMass,
            },
            adherence: {
                last7Days: adherence
            },
            streak: {
                currentStreak,
                bestStreak,
                period: 90
            },
            today: {
                totalTodayMeals,
                completedMealsToday,
                totalCaloriesTarget,
                totalCaloriesConsumed,
                totalProteinConsumed,
                totalCarbsConsumed,
                totalFatConsumed,
                adherenceToday
            },
            activeMealPlan
        }
    }

    async updatePatientStatus({adminUserId, patientId, status}: UpdatePatientStatusRequest) {
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
        })

        if (!patient) {
            throw new AppError("Paciente não pertence ao nutricionista.")
        }

        await this.patientRepository.updatePatientStatus(patientId, status)
    }
}