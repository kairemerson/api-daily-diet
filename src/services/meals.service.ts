import { AppError } from "@/errors/app-error";
import { prisma } from "@/lib/prisma";
import { MealsRepository } from "@/repositories/meals.repository";

interface CreateMealRequest {
    name: string
    description?: string
    date: Date
    isOnDiet: boolean
    mealPlanItemId?: string
    consumedCalories?: number
    consumedProtein?: number
    consumedCarbs?: number
    consumedFat?: number
}

interface UpdateMealRequest {
  name: string
  description?: string
  date: Date
  isOnDiet: boolean
}



export class MealsService {
    constructor(private mealsRepository: MealsRepository) {}

    async create(data: CreateMealRequest, userId: string) {

        // Se NÃO tem mealPlanItem → só verifica se paciente existe
        if (!data.mealPlanItemId) {

            const patient = await prisma.patientProfile.findUnique({
                where: { userId }
            })

            if (!patient) {
                throw new AppError("Perfil de paciente não encontrado")
            }

            return this.mealsRepository.create({
                ...data,
                patientProfileId: patient.id
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

        return this.mealsRepository.create({
            ...data,
            patientProfileId: mealPlanItem.mealPlan.patientId
        })
    }

    async listByUser(userId: string) {
        return this.mealsRepository.findManyByUserId(userId)
    }

    async getById(id: string, userId: string) {
        const meal = await this.mealsRepository.findByIdAndUserId(id, userId)
        
        if(!meal) {
            throw new Error("Meal not found")
        }

        return meal
    }

    async update(id: string, userId: string, data: UpdateMealRequest) {
        const meal = await this.mealsRepository.findByIdAndUserId(id, userId)

        if(!meal) {
            throw new Error("Meal not found")
        }

        return this.mealsRepository.update(id, data)
    }

    async delete(id: string, userId: string){
        const meal = await this.mealsRepository.findByIdAndUserId(id, userId)

        if(!meal) {
            throw new Error("Meal not found")
        }

        await this.mealsRepository.delete(id)
    }
}