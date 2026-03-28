import { AppError } from "../../errors/app-error";
import { dateToLocalString } from "../../helpers/build-dates";
import { prisma } from "../../lib/prisma";
import { MealRepository } from "../../repositories/meal-repository.interface";


export class ListByUserIdUseCase {
    constructor(private mealRepository: MealRepository){}

    async execute(userId: string) {
        const patient = await prisma.patientProfile.findUnique({
            where: { userId }
        })

        if (!patient) {
            throw new AppError("Perfil de paciente não encontrado")
        }

        const meals = await this.mealRepository.findManyByPatientId(patient.id)

        const grouped: Record<string, typeof meals> = {}

        for (const meal of meals) {
            const dateKey = dateToLocalString(meal.dateTime)

            if (!grouped[dateKey]) {
                grouped[dateKey] = []
            }

            grouped[dateKey].push(meal)
        }

        const sections = Object.keys(grouped)
            .sort((a, b) => b.localeCompare(a)) // dias DESC
            .map(date => ({
                title: date,
                data: grouped[date]
            }))

        return sections
    }

}