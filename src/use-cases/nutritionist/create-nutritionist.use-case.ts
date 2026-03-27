import { AppError } from "../../errors/app-error";
import { prisma } from "../../lib/prisma";
import { NutritionistRepository } from "../../repositories/nutritionist-repository.interface";

interface CreateNutritionistRequest {
    userId: string
    crn: string
    specialty?: string
    clinic?: string
    phone?: string
}

export class CreateNutritionistUseCase {
    constructor(private nutritionistRepository: NutritionistRepository){}

    async execute(data: CreateNutritionistRequest) {
        const user = await prisma.user.findUnique({
            where: {id: data.userId}
        })

        if(!user || user.role !== "ADMIN") {
            throw new AppError("Somente ADMIN pode criar perfil de nutricionista!")
        }
        
        const alreadyExists = await this.nutritionistRepository.findByUserId(data.userId)
        
        if(alreadyExists) {
            throw new AppError("Perfil já cadastrado", 409)
        }

        return this.nutritionistRepository.create(data)
    }
}