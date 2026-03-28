import { AppError } from "../../errors/app-error";
import { prisma } from "../../lib/prisma";
import { MealRepository } from "../../repositories/meal-repository.interface";


export class GetMealByIdUseCase {
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
            throw new Error("Refeição não encontrada.")
        }

        return meal
    }
}