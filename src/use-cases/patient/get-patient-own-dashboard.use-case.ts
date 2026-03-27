import { AppError } from "../../errors/app-error";
import { dateToLocalString, getLocalDateString } from "../../helpers/build-dates";
import { prisma } from "../../lib/prisma";
import { PatientRepository } from "../../repositories/patient-repository.interface";


export interface GetPatientOwnDashboardRequest {
  userId: string;
}

export interface PatientOwnDashboardMealPlanItem {
  id: string;
  name: string;
  order: number;
  time: string;
}

export interface PatientOwnDashboardMealPlan {
  id: string;
  caloriesTarget: number | null;
  mealPlanItems: PatientOwnDashboardMealPlanItem[];
}

export interface GetPatientOwnDashboardResponse {
  patient: {
    id: string;
    name: string;
    goal: "WEIGHT_LOSS" | "HYPERTROPHY" | "REEDUCATION" | "MAINTENANCE";
    targetWeight: number | null;
    observation: string | null;
  };
  metrics: {
    currentWeight: number | null;
    weightDifference: number | null;
    currentBodyFat: number | null;
    currentMuscleMass: number | null;
  };
  adherence: {
    last7Days: number;
  };
  streak: {
    currentStreak: number;
    bestStreak: number;
    period: 90;
  };
  today: {
    totalTodayMeals: number;
    completedMealsToday: number;
    totalCaloriesTarget: number;
    totalCaloriesConsumed: number;
    totalProteinConsumed: number;
    totalCarbsConsumed: number;
    totalFatConsumed: number;
    adherenceToday: number;
  };
  activeMealPlan: PatientOwnDashboardMealPlan | null;
}

export class GetPatientOwnDashboardUseCase {
    constructor(private patientRepository: PatientRepository){}
    
    async execute(input: GetPatientOwnDashboardRequest): Promise<GetPatientOwnDashboardResponse> {
        const patient = await prisma.patientProfile.findUnique({
            where: {
                userId: input.userId,
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
}