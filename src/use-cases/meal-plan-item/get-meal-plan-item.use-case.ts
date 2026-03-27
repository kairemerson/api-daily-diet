import { AppError } from "../../errors/app-error";
import { prisma } from "../../lib/prisma";
import { MealPLanItemRepository } from "../../repositories/meal-plan-item-repository.interface";

export class GetMealPlanItemUseCase {
    constructor(private mealPlanItemRespository: MealPLanItemRepository){}

    async execute(input: {mealPlanItemId: string, userId: string}) {
        const patient = await prisma.patientProfile.findUnique({
            where: {
                userId: input.userId
            }
        })

        const mealPlanItem = await prisma.mealPlanItem.findUnique({
            where: {
                id: input.mealPlanItemId,
            },
            include: {
                mealPlan: {
                    select: {
                        patientId: true
                    }
                }
            }
        })

        if(patient?.id !== mealPlanItem?.mealPlan.patientId) {
            throw new AppError("Este plano não pertence ao paciente!")

        }

        return this.mealPlanItemRespository.findMealPlanItemById(input.mealPlanItemId)
    }
}