// import { GetMealsMetricsService } from "@/services/get-meals-metrics.service";
import { MealsService } from "../services/meals.service";
import { FastifyReply, FastifyRequest } from "fastify";
import {z} from "zod"


export class MealsController {
    constructor(private mealService: MealsService){}

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

        const meal = await this.mealService.create(data, userId)

        return reply.status(201).send(meal)
    }

    async listByUserId(request: FastifyRequest, reply: FastifyReply) {
        const userId = request.user.sub


        const meals = await this.mealService.listByUserId(userId)        

        return reply.status(200).send(meals)
    }

    async getById(request: FastifyRequest, reply: FastifyReply) {
        const paramsSchema = z.object({
            id: z.string()
        })

        const {id} = paramsSchema.parse(request.params)

        const userId = request.user.sub

        const meal = await this.mealService.getById(id, userId)

        return reply.status(200).send(meal)
        

    }

    async getByPatientId(request: FastifyRequest, reply: FastifyReply) {
        const paramsSchema = z.object({
            patientId: z.string()
        })
        
        const {patientId} = paramsSchema.parse(request.params)

        const userId = request.user.sub

        const meal = await this.mealService.getByPatientId(patientId, userId)
        
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

        const meal = await this.mealService.update(id, userId, data)
            
        return reply.status(200).send(meal)
       

    }

    async delete(request: FastifyRequest, reply: FastifyReply) {
        const paramsSchema = z.object({
            id: z.uuid()
        })

        const {id} = paramsSchema.parse(request.params)

        const userId = request.user.sub

        await this.mealService.delete(id, userId)

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