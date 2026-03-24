import { AppError } from "@/errors/app-error";
import { prisma } from "@/lib/prisma";
import { NutritionistRepository } from "@/repositories/nutritionist-repository.interface";

interface Request {
    userId: string
    crn: string
    specialty?: string
    clinic?: string
    phone?: string
}

export class NutritionistProfileService {
    constructor(private nutritionistRepository: NutritionistRepository){}

    async execute({userId, ...data}: Request){
        const user = await prisma.user.findUnique({
            where: {id: userId}
        })

        if(!user || user.role !== "ADMIN") {
            throw new AppError("Somente ADMIN pode criar perfil de nutricionista!")
        }
        
        const alreadyExists = await this.nutritionistRepository.findByUserId(userId)
        
        if(alreadyExists) {
            throw new AppError("Perfil já cadastrado", 409)
        }

        return this.nutritionistRepository.create({
            userId,
            ...data
        })
    }
}