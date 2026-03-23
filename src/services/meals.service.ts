import { AppError } from "@/errors/app-error";
import { buildDate, dateToLocalString } from "@/helpers/build-dates";
import { prisma } from "@/lib/prisma";
import { MealsRepository } from "@/repositories/meals.repository";

interface CreateMealRequest {
    name: string
    description?: string
    date: string
    time: string
    isOnDiet: boolean
    mealPlanItemId?: string
    consumedCalories?: number
    consumedProtein?: number
    consumedCarbs?: number
    consumedFat?: number
}

interface UpdateMealRequest {
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

export class MealsService {
    constructor(private mealsRepository: MealsRepository) {}

    async create(data: CreateMealRequest, userId: string) {

        const [day, month, year] = data.date.split("/")
        const isoDate = `${year}-${month}-${day}`

        const dateTime = new Date(
            Number(year),
            Number(month) - 1,
            Number(day),
            Number(data.time.split(":")[0]),
            Number(data.time.split(":")[1])
        )

        const now = new Date()

        if(dateTime.getTime() > now.getTime()) {
            throw new AppError("Não é permitido registrar refeição no futuro")
        }


        // Se NÃO tem mealPlanItem → só verifica se paciente existe
        if (!data.mealPlanItemId) {

            const patient = await prisma.patientProfile.findUnique({
                where: { userId }
            })

            if (!patient) {
                throw new AppError("Perfil de paciente não encontrado")
            }

            return this.mealsRepository.create({
                name: data.name,
                description: data.description,
                isOnDiet: data.isOnDiet,
                date: isoDate,
                time: data.time,
                dateTime,
                mealPlanItemId: data.mealPlanItemId,
                consumedCalories: data.consumedCalories,
                consumedProtein: data.consumedProtein,
                consumedCarbs: data.consumedCarbs,
                consumedFat: data.consumedFat,
                patientProfileId: patient.id,
            })
        }

        // Se TEM mealPlanItem → valida ownership na mesma query
        const mealPlanItem = await prisma.mealPlanItem.findFirst({
            where: {
            id: data.mealPlanItemId,
            mealPlan: {
                patient: {
                    userId: userId
                }
            }
            },
            include: {
                mealPlan: {
                    select: {
                        patientId: true
                    }
                }
            }
        })

        if (!mealPlanItem) {
            throw new AppError("Item do plano não encontrado ou não pertence a você")
        }

        return this.mealsRepository.create({
            name: data.name,
            description: data.description,
            isOnDiet: data.isOnDiet,
            date: isoDate,
            time: data.time,
            dateTime,
            mealPlanItemId: data.mealPlanItemId,
            consumedCalories: data.consumedCalories,
            consumedProtein: data.consumedProtein,
            consumedCarbs: data.consumedCarbs,
            consumedFat: data.consumedFat,
            patientProfileId: mealPlanItem.mealPlan.patientId
        })
    }

    async listByUserId(userId: string) {
        const patient = await prisma.patientProfile.findUnique({
            where: { userId }
        })

        if (!patient) {
            throw new AppError("Perfil de paciente não encontrado")
        }

        const meals = await this.mealsRepository.findManyByPatientId(patient.id)

        const grouped: Record<string, typeof meals> = {}

        for (const meal of meals) {
            const dateKey = dateToLocalString(meal.dateTime)

            if (!grouped[dateKey]) {
                grouped[dateKey] = []
            }

            grouped[dateKey].push(meal)
        }

        const sections = Object.keys(grouped)
            .sort((a, b) => b.localeCompare(a)) // dias DESC
            .map(date => ({
                title: date,
                data: grouped[date]
            }))

        return sections
    }

    async getById(id: string, userId: string) {
        const patient = await prisma.patientProfile.findUnique({
            where: { userId }
        })

        if (!patient) {
            throw new AppError("Perfil de paciente não encontrado.")
        }

        const meal = await this.mealsRepository.findByIdAndPatientId(id, patient.id)
        
        if(!meal) {
            throw new Error("Refeição não encontrada.")
        }

        return meal
    }

    async getByPatientId(id: string, userId: string) {

        const admin = await prisma.user.findUnique({
            where: { id: userId },
            include: { nutritionistProfile: true }
        })

        if (!admin || admin.role !== "ADMIN") {
            throw new AppError("Apenas ADMIN pode buscar refeições do paciente.")
        }

        if (!admin.nutritionistProfile) {
            throw new AppError("Perfil do nutricionista não encontrado.")
        }

        const patient = await prisma.patientProfile.findUnique({
            where: { 
                id, 
                nutritionistId: admin.nutritionistProfile.id
            }
        })

        if (!patient) {
            throw new AppError("Perfil de paciente não encontrado.")
        }

        const meals = await this.mealsRepository.findByPatientId(patient.id)

        const grouped: Record<string, typeof meals> = {}

        for (const meal of meals) {
            const dateKey = dateToLocalString(meal.dateTime)

            if (!grouped[dateKey]) {
                grouped[dateKey] = []
            }

            grouped[dateKey].push(meal)
        }

        const sections = Object.entries(grouped)
            .sort(([a], [b]) => b.localeCompare(a)) //dias desc
            .map(([date, data]) => ({
                title: date,
                data
            }))

        return sections
    }

    async update(id: string, userId: string, data: UpdateMealRequest) {
        const [day, month, year] = data.date.split("/")
        const isoDate = `${year}-${month}-${day}`

        const dataDate = new Date(
            Number(year),
            Number(month) - 1,
            Number(day),
            Number(data.time.split(":")[0]),
            Number(data.time.split(":")[1])
        )

        const now = new Date()

        if(dataDate.getTime() > now.getTime()) {
            throw new AppError("Não é permitido registrar refeição no futuro")
        }

        const patient = await prisma.patientProfile.findUnique({
            where: { userId }
        })

        if (!patient) {
            throw new AppError("Perfil de paciente não encontrado.")
        }

        const meal = await this.mealsRepository.findByIdAndPatientId(id, patient.id)

        if(!meal) {
            throw new AppError("Refeição não encontrada.")
        }

        return this.mealsRepository.update(id, {...data, date: isoDate})
    }

    async delete(id: string, userId: string){

        const patient = await prisma.patientProfile.findUnique({
            where: { userId }
        })

        if (!patient) {
            throw new AppError("Perfil de paciente não encontrado.")
        }

        const meal = await this.mealsRepository.findByIdAndPatientId(id, patient.id)

        if(!meal) {
            throw new AppError("Refeição não encontrada.")
        }

        await this.mealsRepository.delete(meal.id)
    }
}