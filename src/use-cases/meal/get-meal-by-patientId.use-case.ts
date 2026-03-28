import { AppError } from "../../errors/app-error";
import { dateToLocalString } from "../../helpers/build-dates";
import { prisma } from "../../lib/prisma";
import { MealRepository } from "../../repositories/meal-repository.interface";


export class GetMealByPatientIdUseCase {
    constructor(private mealRepository: MealRepository) {}

    async execute(id: string, userId: string) {
        const admin = await prisma.user.findUnique({
            where: { id: userId },
            include: { nutritionistProfile: true }
        })

        if (!admin || admin.role !== "ADMIN") {
            throw new AppError("Apenas ADMIN pode buscar refeições do paciente.")
        }

        if (!admin.nutritionistProfile) {
            throw new AppError("Perfil do nutricionista não encontrado.")
        }

        const patient = await prisma.patientProfile.findUnique({
            where: { 
                id, 
                nutritionistId: admin.nutritionistProfile.id
            }
        })

        if (!patient) {
            throw new AppError("Perfil de paciente não encontrado.")
        }

        const meals = await this.mealRepository.findByPatientId(patient.id)

        const grouped: Record<string, typeof meals> = {}

        for (const meal of meals) {
            const dateKey = dateToLocalString(meal.dateTime)

            if (!grouped[dateKey]) {
                grouped[dateKey] = []
            }

            grouped[dateKey].push(meal)
        }

        const sections = Object.entries(grouped)
            .sort(([a], [b]) => b.localeCompare(a)) //dias desc
            .map(([date, data]) => ({
                title: date,
                data
            }))

        return sections
    }
}