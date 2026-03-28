import { AppError } from "../../errors/app-error";
import { prisma } from "../../lib/prisma";
import { MealPlanRepository } from "../../repositories/meal-plan-repository.interface";

interface GetByPatientIdRequest {
  adminUserId: string
  patientId: string
}

export class GetByPatientIdUseCase {
    constructor(private mealPlanRepository: MealPlanRepository){}
    
    async execute({adminUserId, patientId}: GetByPatientIdRequest){
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
            id: patientId,
                nutritionistId: admin.nutritionistProfile.id
            }
        })
        
        if (!patient) {
            throw new AppError("Paciente não pertence ao Nutricionista!")
        }

        return this.mealPlanRepository.findByPatientId(patient.id)
    }
} 