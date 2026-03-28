import { AppError } from "../../errors/app-error";
import { prisma } from "../../lib/prisma";
import { MealRepository } from "../../repositories/meal-repository.interface";

export class DeleteMealUseCase {
    constructor(private mealRepository: MealRepository) {}

    async execute(id: string, userId: string) {
        const patient = await prisma.patientProfile.findUnique({
            where: { userId }
        })

        if (!patient) {
            throw new AppError("Perfil de paciente não encontrado.")
        }

        const meal = await this.mealRepository.findByIdAndPatientId(id, patient.id)

        if(!meal) {
            throw new AppError("Refeição não encontrada.")
        }

        await this.mealRepository.delete(meal.id)
    }
}