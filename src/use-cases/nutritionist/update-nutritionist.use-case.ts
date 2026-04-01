import { AppError } from "../../errors/app-error"
import { prisma } from "../../lib/prisma"
import { NutritionistRepository } from "../../repositories/nutritionist-repository.interface"


interface UpdateNutritionistRequest {
    userId: string
    crn: string
    specialty?: string
    clinic?: string
    phone?: string
}

export class UpdateNutritionistUseCase {
    constructor(private nutritionistRepository: NutritionistRepository){}
    
    async execute(data: UpdateNutritionistRequest) {
        const admin = await prisma.user.findUnique({
            where: { id: data.userId },
            include: { nutritionistProfile: true }
        })

        if (!admin || admin.role !== "ADMIN") {
            throw new AppError("Apenas ADMIN pode acessar dashboard.")
        }

        if (!admin.nutritionistProfile) {
            throw new AppError("Perfil do nutricionista não encontrado.")
        }

        await this.nutritionistRepository.updateNutritionist(admin.nutritionistProfile.id, data)
    }
}