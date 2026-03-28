import { FastifyReply, FastifyRequest } from "fastify";
import {z} from "zod"
import { MealRepository } from "../repositories/meal-repository.interface";
import { CreateMealUseCase } from "../use-cases/meal/create-meal.use-case";
import { ListByUserIdUseCase } from "../use-cases/meal/list-by-userId.use-case";
import { GetMealByIdUseCase } from "../use-cases/meal/get-meal-by-id.use-case";
import { GetMealByPatientIdUseCase } from "../use-cases/meal/get-meal-by-patientId.use-case";
import { UpdateMealUseCase } from "../use-cases/meal/update-meal.use-case";
import { DeleteMealUseCase } from "../use-cases/meal/delete-meal.use-case";


export class MealsController {
    constructor(
        private mealRepository: MealRepository,
        private createMealUseCase = new CreateMealUseCase(mealRepository),
        private listByUserIdUseCase = new ListByUserIdUseCase(mealRepository),
        private getMealByIdUseCase = new GetMealByIdUseCase(mealRepository),
        private getMealByPatientIdUseCase = new GetMealByPatientIdUseCase(mealRepository),
        private updateMealUseCase = new UpdateMealUseCase(mealRepository),
        private deleteMealUseCase = new DeleteMealUseCase(mealRepository)
    ){}

    async create(request: FastifyRequest, reply: FastifyReply) {
        const bodySchema = z.object({
            name: z.string(),
            description: z.string().optional(),
            date: z.string(),
            time: z.string(),
            isOnDiet: z.boolean(),
            mealPlanItemId: z.string().optional(),
            consumedCalories: z.number().optional(),
            consumedProtein: z.number().optional(),
            consumedCarbs: z.number().optional(),
            consumedFat: z.number().optional(),
        })

        const data = bodySchema.parse(request.body)        

        const userId = request.user.sub        

        const meal = await this.createMealUseCase.execute(data, userId)

        return reply.status(201).send(meal)
    }

    async listByUserId(request: FastifyRequest, reply: FastifyReply) {
        const userId = request.user.sub


        const meals = await this.listByUserIdUseCase.execute(userId)        

        return reply.status(200).send(meals)
    }

    async getById(request: FastifyRequest, reply: FastifyReply) {
        const paramsSchema = z.object({
            id: z.string()
        })

        const {id} = paramsSchema.parse(request.params)

        const userId = request.user.sub

        const meal = await this.getMealByIdUseCase.execute(id, userId)

        return reply.status(200).send(meal)
        

    }

    async getByPatientId(request: FastifyRequest, reply: FastifyReply) {
        const paramsSchema = z.object({
            patientId: z.string()
        })
        
        const {patientId} = paramsSchema.parse(request.params)

        const userId = request.user.sub

        const meal = await this.getMealByPatientIdUseCase.execute(patientId, userId)
        
        return reply.status(200).send(meal)
        

    }

    async update(request: FastifyRequest, reply: FastifyReply) {
        const paramsSchema = z.object({
            id: z.uuid()
        })

        const bodySchema = z.object({
            name: z.string(),
            description: z.string().optional(),
            date: z.string(),
            time: z.string(),
            isOnDiet: z.boolean(),
            consumedCalories: z.number().optional(),
            consumedProtein: z.number().optional(),
            consumedCarbs: z.number().optional(),
            consumedFat: z.number().optional(),
        })

        const {id} = paramsSchema.parse(request.params)
        const data = bodySchema.parse(request.body)

        const userId = request.user.sub

        const meal = await this.updateMealUseCase.execute(id, userId, data)
            
        return reply.status(200).send(meal)
       

    }

    async delete(request: FastifyRequest, reply: FastifyReply) {
        const paramsSchema = z.object({
            id: z.uuid()
        })

        const {id} = paramsSchema.parse(request.params)

        const userId = request.user.sub

        await this.deleteMealUseCase.execute(id, userId)

        return reply.status(204).send()

    }

    // async metrics(request: FastifyRequest, reply: FastifyReply) {
    //     const userId = request.user.sub

    //     const mealsRepository = new MealsRepository()
    //     const getMealsMetricsService = new GetMealsMetricsService(mealsRepository)

    //     const metrics = await getMealsMetricsService.execute(userId)

    //     return reply.send(metrics)
    // }
}