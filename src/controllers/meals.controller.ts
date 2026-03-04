import { MealsRepository } from "@/repositories/meals.repository";
import { GetMealsMetricsService } from "@/services/get-meals-metrics.service";
import { MealsService } from "@/services/meals.service";
import { FastifyReply, FastifyRequest } from "fastify";
import {z} from "zod"


export class MealsController {
    async create(request: FastifyRequest, reply: FastifyReply) {
        const bodySchema = z.object({
            name: z.string(),
            description: z.string().optional(),
            date: z.coerce.date(),
            isOnDiet: z.boolean(),
            mealPlanItemId: z.string().optional(),
            consumedCalories: z.number().optional(),
            consumedProtein: z.number().optional(),
            consumedCarbs: z.number().optional(),
            consumedFat: z.number().optional(),
        })

        const data = bodySchema.parse(request.body)

        const userId = request.user.sub

        const mealsRepository = new MealsRepository()
        const mealService = new MealsService(mealsRepository)

        const meal = await mealService.create(data, userId)

        return reply.status(201).send(meal)
    }

    async list(request: FastifyRequest, reply: FastifyReply) {
        const userId = request.user.sub

        const mealsRepository = new MealsRepository()
        const mealService = new MealsService(mealsRepository)

        const meals = await mealService.listByUser(userId)        

        return reply.send(meals)
    }

    async get(request: FastifyRequest, reply: FastifyReply) {
        const paramsSchema = z.object({
            id: z.string()
        })

        const {id} = paramsSchema.parse(request.params)

        const userId = request.user.sub

        const mealsRepository = new MealsRepository()
        const mealService = new MealsService(mealsRepository)

        try {
            const meal = await mealService.getById(id, userId)
            return reply.send(meal)
        } catch {
            return reply.status(404).send({ message: "Meal not found" })
        }

    }

    async update(request: FastifyRequest, reply: FastifyReply) {
        const paramsSchema = z.object({
            id: z.uuid()
        })

        const bodySchema = z.object({
            name: z.string(),
            description: z.string().optional(),
            date: z.coerce.date(),
            isOnDiet: z.boolean()
        })

        const {id} = paramsSchema.parse(request.params)
        const data = bodySchema.parse(request.body)

        const userId = request.user.sub

        const mealsRepository = new MealsRepository()
        const mealService = new MealsService(mealsRepository)

        try {
            const meal = await mealService.update(id, userId, data)
            return reply.send(meal)
        } catch {
            return reply.status(404).send({ message: "Meal not found" })
        }

    }

    async delete(request: FastifyRequest, reply: FastifyReply) {
        const paramsSchema = z.object({
            id: z.uuid()
        })

        const {id} = paramsSchema.parse(request.params)

        const userId = request.user.sub

        const mealsRepository = new MealsRepository()
        const mealService = new MealsService(mealsRepository)

        try {
            await mealService.delete(id, userId)
            return reply.status(204).send()
        } catch {
            return reply.status(404).send({ message: "Meal not found" })
        }

    }

    async metrics(request: FastifyRequest, reply: FastifyReply) {
        const userId = request.user.sub

        const mealsRepository = new MealsRepository()
        const getMealsMetricsService = new GetMealsMetricsService(mealsRepository)

        const metrics = await getMealsMetricsService.execute(userId)

        return reply.send(metrics)
    }
}