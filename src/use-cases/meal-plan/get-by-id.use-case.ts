import { AppError } from "../../errors/app-error";
import { prisma } from "../../lib/prisma";
import { MealPlanRepository } from "../../repositories/meal-plan-repository.interface";

interface GetByIdRequest {
  adminUserId: string
  mealPlanId: string
}

export class GetByIdUseCase {
        constructor(private mealPlanRepository: MealPlanRepository){}

        async execute({adminUserId, mealPlanId}: GetByIdRequest) {
            const admin = await prisma.user.findUnique({
                where: {id: adminUserId},
                include: {nutritionistProfile: true}
            })
    
            if(!admin || admin.role !== "ADMIN") {
                throw new AppError("Somente ADMIN pode visualizar planos!")
            }
    
            if(!admin.nutritionistProfile) {
                throw new AppError("Perfil do nutricionista não encontrado!")
            }
    
            const patient = await prisma.patientProfile.findFirst({
                where: {
                    nutritionistId: admin.nutritionistProfile.id
                }
            })
    
            if (!patient) {
                throw new AppError("Paciente não pertence ao Nutricionista!")
            }
    
            return this.mealPlanRepository.findById(mealPlanId)
        }
}