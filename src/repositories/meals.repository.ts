import { prisma } from "@/lib/prisma"

type CreateMealData = {
    name: string
    description?: string
    date: string
    time: string
    dateTime: Date
    isOnDiet: boolean
    patientProfileId: string
    mealPlanItemId?: string
    consumedCalories?: number
    consumedProtein?: number
    consumedCarbs?: number
    consumedFat?: number
}

type UpdateMealData = {
    name: string
    description?: string
    date: string
    time: string
    isOnDiet: boolean
    consumedCalories?: number
    consumedProtein?: number
    consumedCarbs?: number
    consumedFat?: number
}

export class MealsRepository {
    async create(data: CreateMealData) {
        
        return prisma.meal.create({ data })
    }

    async findManyByPatientId(patientId: string) {
        return prisma.meal.findMany({
            where: {
                patientProfileId: patientId
            },
            orderBy: {
                dateTime: "desc"
            }
        })
    }

    async findByPatientId(patientId: string) {

        return prisma.meal.findMany({
            where: {
                patientProfileId: patientId,
            },
            orderBy: {
                dateTime: "desc"
            }
        })
    }

    async findByIdAndPatientId(id: string, patientId: string) {
        return prisma.meal.findFirst({
            where: {
                id,
                patientProfileId: patientId
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