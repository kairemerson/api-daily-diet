import { AppError } from "../../errors/app-error"
import { prisma } from "../../lib/prisma"
import { MealRepository } from "../../repositories/meal-repository.interface"


interface CreateMealRequest {
    name: string
    description?: string
    date: string
    time: string
    isOnDiet: boolean
    mealPlanItemId?: string
    consumedCalories?: number
    consumedProtein?: number
    consumedCarbs?: number
    consumedFat?: number
}

export class CreateMealUseCase {
    constructor(private mealRepository: MealRepository) {}

    async execute(data: CreateMealRequest, userId: string) {
        const [day, month, year] = data.date.split("/")
        const isoDate = `${year}-${month}-${day}`

        const dateTime = new Date(
            Number(year),
            Number(month) - 1,
            Number(day),
            Number(data.time.split(":")[0]),
            Number(data.time.split(":")[1])
        )

        const now = new Date()

        if(dateTime.getTime() > now.getTime()) {
            throw new AppError("Não é permitido registrar refeição no futuro")
        }


        // Se NÃO tem mealPlanItem → só verifica se paciente existe
        if (!data.mealPlanItemId) {

            const patient = await prisma.patientProfile.findUnique({
                where: { userId }
            })

            if (!patient) {
                throw new AppError("Perfil de paciente não encontrado")
            }

            return this.mealRepository.create({
                name: data.name,
                description: data.description,
                isOnDiet: data.isOnDiet,
                date: isoDate,
                time: data.time,
                dateTime,
                mealPlanItemId: data.mealPlanItemId,
                consumedCalories: data.consumedCalories,
                consumedProtein: data.consumedProtein,
                consumedCarbs: data.consumedCarbs,
                consumedFat: data.consumedFat,
                patientProfileId: patient.id,
            })
        }

        // Se TEM mealPlanItem → valida ownership na mesma query
        const mealPlanItem = await prisma.mealPlanItem.findFirst({
            where: {
            id: data.mealPlanItemId,
            mealPlan: {
                patient: {
                    userId: userId
                }
            }
            },
            include: {
                mealPlan: {
                    select: {
                        patientId: true
                    }
                }
            }
        })

        if (!mealPlanItem) {
            throw new AppError("Item do plano não encontrado ou não pertence a você")
        }

        return this.mealRepository.create({
            name: data.name,
            description: data.description,
            isOnDiet: data.isOnDiet,
            date: isoDate,
            time: data.time,
            dateTime,
            mealPlanItemId: data.mealPlanItemId,
            consumedCalories: data.consumedCalories,
            consumedProtein: data.consumedProtein,
            consumedCarbs: data.consumedCarbs,
            consumedFat: data.consumedFat,
            patientProfileId: mealPlanItem.mealPlan.patientId
        })
    }
}