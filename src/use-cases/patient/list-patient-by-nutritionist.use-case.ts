import { AppError } from "../../errors/app-error";
import { prisma } from "../../lib/prisma";
import { PatientRepository } from "../../repositories/patient-repository.interface";

export interface ListPatientsByNutritionistRequest {
  userId: string;
}

export interface ListPatientsByNutritionistResponse {
  id: string;
  name: string;
  email: string;
  lastActivity: Date | null;
  adherence: number;
  totalMeals: number;
}

export class ListPatientByNutritionistUseCase {
    constructor(private patientRepository: PatientRepository){}

    async execute(input: ListPatientsByNutritionistRequest): Promise<ListPatientsByNutritionistResponse[]> {
        const user = await prisma.user.findUnique({
            where: { id: input.userId },
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
}