import { PatientStatus } from "@prisma/client";
import { PatientRepository } from "../repositories/patient-repository.interface";
import { prisma } from "../lib/prisma";
import { AppError } from "../errors/app-error";

export interface GetPatientDashboardRequest {
  adminUserId: string;
  patientId: string;
}

export interface GetPatientDashboardMealPlanItem {
  id: string;
  name: string;
  order: number;
  time: string;
}

export interface GetPatientDashboardMealPlan {
  id: string;
  caloriesTarget: number | null;
  mealPlanItems: GetPatientDashboardMealPlanItem[];
}

export interface GetPatientDashboardResponse {
  patient: {
    id: string;
    name: string;
    goal: "WEIGHT_LOSS" | "HYPERTROPHY" | "REEDUCATION" | "MAINTENANCE";
    status: PatientStatus;
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
  mealPlans: GetPatientDashboardMealPlan[];
}

export class GetPatientDashboardUseCase {
    constructor(private patientRepository: PatientRepository){}

    async execute(input: GetPatientDashboardRequest): Promise<GetPatientDashboardResponse> {
        const admin = await prisma.user.findUnique({
            where: { id: input.adminUserId },
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
                id: input.patientId,
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
                where: { patientId: input.patientId },
                orderBy: { recordedAt: "asc" }
            }),
            prisma.bodyMetrics.findFirst({
                where: { patientId: input.patientId },
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
                patientId: input.patientId,
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
                patientProfileId: input.patientId,
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
}