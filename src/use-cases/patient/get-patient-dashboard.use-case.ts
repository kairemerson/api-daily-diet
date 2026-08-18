import { PatientStatus } from "@prisma/client";
import { PatientRepository } from "../../repositories/patient-repository.interface";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../errors/app-error";
import { BodyMetricsRepository } from "../../repositories/body-metrics-repository.interface";

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

export interface WeightHistoryPoint {
  id: string;
  weight: number;
  recordedAt: Date;
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
    weightHistory: WeightHistoryPoint[];
  };
  adherence: {
    last7Days: number;
  };
  mealPlans: GetPatientDashboardMealPlan[];
}

export class GetPatientDashboardUseCase {
  constructor(
    private patientRepository: PatientRepository,
    private bodyMetricsRepository: BodyMetricsRepository
  ) {}

  async execute(input: GetPatientDashboardRequest): Promise<GetPatientDashboardResponse> {
    const admin = await prisma.user.findUnique({
      where: { id: input.adminUserId },
      include: { nutritionistProfile: true }
    });

    if (!admin || admin.role !== "ADMIN") {
      throw new AppError("Apenas ADMIN pode acessar dashboard.");
    }

    if (!admin.nutritionistProfile) {
      throw new AppError("Perfil do nutricionista não encontrado.");
    }

    const patient = await prisma.patientProfile.findFirst({
      where: {
        id: input.patientId,
        nutritionistId: admin.nutritionistProfile.id
      },
      include: {
        user: true
      }
    });

    if (!patient) {
      throw new AppError("Paciente não pertence ao nutricionista.");
    }

    // 1. Buscar todo o histórico de métricas corporais do paciente
    const allMetrics = await this.bodyMetricsRepository.findByPatientId(patient.id)

    // 2. Extrair primeiro e último registro
    const firstMetric = allMetrics.length > 0 ? allMetrics[0] : null;
    const lastMetric = allMetrics.length > 0 ? allMetrics[allMetrics.length - 1] : null;

    const currentWeight = lastMetric?.weight ?? null;
    const weightDifference =
      firstMetric?.weight != null && lastMetric?.weight != null
        ? lastMetric.weight - firstMetric.weight
        : null;

    const currentBodyFat = lastMetric?.bodyFat ?? null;
    const currentMuscleMass = lastMetric?.muscleMass ?? null;

    // 3. Filtrar e formatar apenas as medições que possuem peso registrado para o gráfico
    const weightHistory: WeightHistoryPoint[] = allMetrics
      .filter((m) => m.weight !== null && m.weight !== undefined)
      .map((m) => ({
        id: m.id,
        weight: m.weight as number,
        recordedAt: m.recordedAt ?? new Date(),
      }));

    // 4. Buscar planos alimentares
    const mealPlans = await prisma.mealPlan.findMany({
      where: {
        patientId: input.patientId,
      },
      include: {
        mealPlanItems: true
      }
    });

    // 5. Calcular aderência nos últimos 7 dias
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setHours(0, 0, 0, 0);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const mealsLast7Days = await prisma.meal.findMany({
      where: {
        patientProfileId: input.patientId,
        dateTime: { gte: sevenDaysAgo },
      },
      select: {
        isOnDiet: true
      }
    });

    const totalMeals = mealsLast7Days.length;
    const onDietMeals = mealsLast7Days.filter((m) => m.isOnDiet).length;

    const adherence =
      totalMeals > 0
        ? Math.round((onDietMeals / totalMeals) * 100)
        : 0;

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
        currentMuscleMass,
        weightHistory
      },
      adherence: {
        last7Days: adherence
      },
      mealPlans
    };
  }
}