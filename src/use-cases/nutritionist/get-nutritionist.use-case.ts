import { AppError } from "../../errors/app-error";
import { prisma } from "../../lib/prisma";
import { NutritionistRepository } from "../../repositories/nutritionist-repository.interface";


export class GetNutritionistUseCase {
    constructor(private nutritionistRepository: NutritionistRepository) {}

    async execute(userId: string) {
        const user = await prisma.user.findUnique({
            where: {id: userId}
        })

        if(!user || user.role !== "ADMIN") {
            throw new AppError("Somente ADMIN pode criar perfil de nutricionista!")
        }
        
        const nutritionistProfile = await this.nutritionistRepository.findByUserId(userId)
        
        if(!nutritionistProfile) {
            throw new AppError("Perfil do Nutricionista não encontrado", 404)
        }

        return {
            nutritionistProfile
        }
    }
}