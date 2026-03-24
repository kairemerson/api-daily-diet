import { prisma } from "../lib/prisma"
import { CreateMealDTO, MealRepository, UpdateMealDTO } from "./meal-repository.interface"

export class PrismaMealsRepository implements MealRepository {
    async create(data: CreateMealDTO) {
        
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

    async update(id: string, data: UpdateMealDTO) {
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