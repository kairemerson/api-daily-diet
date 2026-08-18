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
  completedToday: boolean;
  isOnDietToday: boolean | null;
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
  constructor(private patientRepository: PatientRepository) {}

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
          select: { name: true },
        },
      },
    });

    if (!patient) {
      throw new AppError("Paciente não encontrado.");
    }

    // Datas base para consultas
    const todayStr = getLocalDateString();

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setHours(0, 0, 0, 0);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysAgoStr = dateToLocalString(sevenDaysAgo);

    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    const ninetyDaysAgoStr = dateToLocalString(ninetyDaysAgo);

    // Executa consultas concorrentes em paralelo
    const [
      firstMetric,
      lastMetric,
      rawActiveMealPlan,
      mealsLast7Days,
      mealsToday,
      mealsLast90Days,
    ] = await Promise.all([
      prisma.bodyMetrics.findFirst({
        where: { patientId: patient.id },
        orderBy: { recordedAt: "asc" },
      }),
      prisma.bodyMetrics.findFirst({
        where: { patientId: patient.id },
        orderBy: { recordedAt: "desc" },
      }),
      prisma.mealPlan.findFirst({
        where: {
          patientId: patient.id,
          isActive: true,
        },
        select: {
          id: true,
          caloriesTarget: true,
          mealPlanItems: {
            select: {
              id: true,
              name: true,
              order: true,
              time: true,
            },
            orderBy: { order: "asc" },
          },
        },
      }),
      prisma.meal.findMany({
        where: {
          patientProfileId: patient.id,
          date: { gte: sevenDaysAgoStr },
        },
        select: { isOnDiet: true },
      }),
      prisma.meal.findMany({
        where: {
          patientProfileId: patient.id,
          date: todayStr,
        },
        select: {
          mealPlanItemId: true,
          isOnDiet: true,
          consumedCalories: true,
          consumedProtein: true,
          consumedCarbs: true,
          consumedFat: true,
        },
      }),
      prisma.meal.findMany({
        where: {
          patientProfileId: patient.id,
          date: { gte: ninetyDaysAgoStr },
        },
        select: {
          date: true,
          isOnDiet: true,
        },
        orderBy: { date: "desc" },
      }),
    ]);

    // Métricas corporais
    const currentWeight = lastMetric?.weight ?? null;
    const weightDifference =
      firstMetric?.weight && lastMetric?.weight
        ? lastMetric.weight - firstMetric.weight
        : null;
    const currentBodyFat = lastMetric?.bodyFat ?? null;
    const currentMuscleMass = lastMetric?.muscleMass ?? null;

    // Aderência dos últimos 7 dias
    const totalMealsLast7Days = mealsLast7Days.length;
    const onDietMealsLast7Days = mealsLast7Days.filter((m) => m.isOnDiet).length;
    const adherenceLast7Days =
      totalMealsLast7Days > 0
        ? Math.round((onDietMealsLast7Days / totalMealsLast7Days) * 100)
        : 0;

    // Associação de MealPlanItems com os registros de hoje
    const activeMealPlan: PatientOwnDashboardMealPlan | null = rawActiveMealPlan
      ? {
          id: rawActiveMealPlan.id,
          caloriesTarget: rawActiveMealPlan.caloriesTarget,
          mealPlanItems: rawActiveMealPlan.mealPlanItems.map((item) => {
            const registeredMeal = mealsToday.find((m) => m.mealPlanItemId === item.id);
            return {
              ...item,
              completedToday: !!registeredMeal,
              isOnDietToday: registeredMeal ? registeredMeal.isOnDiet : null,
            };
          }),
        }
      : null;

    // Totais e consumo do dia
    const totalTodayMeals = activeMealPlan?.mealPlanItems.length ?? 0;
    const completedMealsToday = mealsToday.length;
    const totalCaloriesTarget = activeMealPlan?.caloriesTarget ?? 0;

    const onDietToday = mealsToday.filter((meal) => meal.isOnDiet).length;
    const adherenceToday =
      completedMealsToday > 0
        ? Math.round((onDietToday / completedMealsToday) * 100)
        : 0;

    const totalsConsumed = mealsToday.reduce(
      (acc, meal) => ({
        calories: acc.calories + (meal.consumedCalories ?? 0),
        protein: acc.protein + (meal.consumedProtein ?? 0),
        carbs: acc.carbs + (meal.consumedCarbs ?? 0),
        fat: acc.fat + (meal.consumedFat ?? 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );

    // Cálculo de Streaks (90 dias)
    const mealsByDay: Record<string, { isOnDiet: boolean }[]> = {};
    for (const meal of mealsLast90Days) {
      if (!mealsByDay[meal.date]) {
        mealsByDay[meal.date] = [];
      }
      mealsByDay[meal.date].push(meal);
    }

    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);

    const days: string[] = [];
    for (let i = 0; i < 90; i++) {
      const d = new Date(todayDate);
      d.setDate(todayDate.getDate() - i);
      days.push(dateToLocalString(d));
    }

    const dayStatus: Record<string, boolean> = {};
    for (const day in mealsByDay) {
      const dayMeals = mealsByDay[day];
      const hasMeals = dayMeals.length > 0;
      const hasOffDiet = dayMeals.some((m) => !m.isOnDiet);
      dayStatus[day] = hasMeals && !hasOffDiet;
    }

    let bestStreak = 0;
    let tempStreak = 0;

    for (const day of days) {
      if (dayStatus[day] === true) {
        tempStreak++;
        bestStreak = Math.max(bestStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    }

    let currentStreak = 0;
    for (let i = 0; i < days.length; i++) {
      const day = days[i];
      const isToday = i === 0;
      const isValidDay = dayStatus[day];
      const hasMeals = mealsByDay[day]?.length > 0;

      if (isToday && !hasMeals) {
        continue;
      }

      if (isValidDay) {
        currentStreak++;
      } else {
        break;
      }
    }

    return {
      patient: {
        id: patient.id,
        name: patient.user.name,
        goal: patient.goal,
        targetWeight: patient.targetWeight,
        observation: patient.observation,
      },
      metrics: {
        currentWeight,
        weightDifference,
        currentBodyFat,
        currentMuscleMass,
      },
      adherence: {
        last7Days: adherenceLast7Days,
      },
      streak: {
        currentStreak,
        bestStreak,
        period: 90,
      },
      today: {
        totalTodayMeals,
        completedMealsToday,
        totalCaloriesTarget,
        totalCaloriesConsumed: totalsConsumed.calories,
        totalProteinConsumed: totalsConsumed.protein,
        totalCarbsConsumed: totalsConsumed.carbs,
        totalFatConsumed: totalsConsumed.fat,
        adherenceToday,
      },
      activeMealPlan,
    };
  }
}