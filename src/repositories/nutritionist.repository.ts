import { prisma } from "@/lib/prisma"

interface CreateNutritionistData {
  userId: string
  crn?: string
  specialty?: string
  clinic?: string
  phone?: string
}

export class NutritionistRepository {
    async create(data: CreateNutritionistData) {
        return prisma.nutritionistProfile.create({data})
    }

    async findByUserId(userId: string) {
    return prisma.nutritionistProfile.findUnique({
      where: { userId }
    })
  }
}