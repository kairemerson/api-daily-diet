import { prisma } from "../lib/prisma"
import { CreateNutritionistDTO, NutritionistRepository } from "./nutritionist-repository.interface"



export class PrismaNutritionistRepository implements NutritionistRepository {
    async create(data: CreateNutritionistDTO) {
        return prisma.nutritionistProfile.create({data})
    }

    async findByUserId(userId: string) {
    return prisma.nutritionistProfile.findUnique({
      where: { userId }
    })
  }
}