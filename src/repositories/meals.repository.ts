import { prisma } from "@/lib/prisma"


type CreateMealData = {
    name: string
    description?: string
    date: Date
    isOnDiet: boolean
    userId: string
}

type UpdateMealData = {
    name: string
    description?: string
    date: Date
    isOnDiet: boolean
}

export class MealsRepository {
    async create(data: CreateMealData) {
        return prisma.meal.create({data})
    }

    async findManyByUserId(userId: string) {
        return prisma.meal.findMany({
            where: {
                userId
            },
            orderBy: {
                date: "desc"
            }
        })
    }

    async findByIdAndUserId(id: string, userId: string) {
        return prisma.meal.findFirst({
            where: {
                id,
                userId
            }
        })
    }

    async update(id: string, data: UpdateMealData) {
        return prisma.meal.update({
            where: {id},
            data
        })
    }

    async delete(id: string) {
        return prisma.meal.delete({
            where: {id}
        })
    }
}