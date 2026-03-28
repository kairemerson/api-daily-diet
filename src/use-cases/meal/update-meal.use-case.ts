import { AppError } from "../../errors/app-error";
import { prisma } from "../../lib/prisma";
import { MealRepository } from "../../repositories/meal-repository.interface";

interface UpdateMealRequest {
    name: string
    description?: string
    date: string
    time: string
    isOnDiet: boolean
    consumedCalories?: number
    consumedProtein?: number
    consumedCarbs?: number
    consumedFat?: number
}

export class UpdateMealUseCase {
    constructor(private mealRepository: MealRepository) {}

    async execute(id: string, userId: string, data: UpdateMealRequest) {
        const [day, month, year] = data.date.split("/")
        const isoDate = `${year}-${month}-${day}`

        const dataDate = new Date(
            Number(year),
            Number(month) - 1,
            Number(day),
            Number(data.time.split(":")[0]),
            Number(data.time.split(":")[1])
        )

        const now = new Date()

        if(dataDate.getTime() > now.getTime()) {
            throw new AppError("Não é permitido registrar refeição no futuro")
        }

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

        return this.mealRepository.update(id, {...data, date: isoDate})
    }
}