import { MealPlanRepository } from "../repositories/mealPlan.repository";
import { MealPlanService } from "../services/meal-plan.service";
import { FastifyReply, FastifyRequest } from "fastify";
import z from "zod";

export class MealPlanController {
    async create(request: FastifyRequest, reply: FastifyReply) {
        const bodySchema =z.object({
            patientId: z.string(),
            title: z.string(),
            description: z.string().optional(),
            caloriesTarget: z.number().optional(),
            proteinTarget: z.number().optional(),
            carbsTarget: z.number().optional(),
            fatTarget: z.number().optional(),
            startDate: z.coerce.date(),
            endDate: z.coerce.date().optional()
        })

        const data = bodySchema.parse(request.body)

        const user_id = request.user.sub
        
        const mealPlanRepository = new MealPlanRepository()
        const service = new MealPlanService(mealPlanRepository)

        const mealPlan = await service.create({adminUserId: user_id, ...data})

        return reply.status(201).send(mealPlan)
    }

    async findByPatienId(request: FastifyRequest, reply: FastifyReply) {
        const paramsSchema = z.object({
            patientId: z.string()
        })

        const {patientId} = paramsSchema.parse(request.params)

        const user_id = request.user.sub        

        const mealPlanRepository = new MealPlanRepository()
        const service = new MealPlanService(mealPlanRepository)

        const mealPlans = await service.findByPatientId({adminUserId: user_id, patientId})

        return reply.status(200).send(mealPlans)

    }

    async findById(request: FastifyRequest, reply: FastifyReply) {
        const paramsSchema = z.object({
            mealPlanId: z.string()
        })

        const {mealPlanId} = paramsSchema.parse(request.params)

        const user_id = request.user.sub        

        const mealPlanRepository = new MealPlanRepository()
        const service = new MealPlanService(mealPlanRepository)

        const mealPlans = await service.findById({adminUserId: user_id, mealPlanId})

        return reply.status(200).send(mealPlans)

    }

    async update(request: FastifyRequest, reply: FastifyReply) {
        const paramsSchema = z.object({
            id: z.uuid()
        })

        const bodySchema =z.object({
            patientId: z.string(),
            title: z.string(),
            description: z.string().optional(),
            caloriesTarget: z.number().optional(),
            proteinTarget: z.number().optional(),
            carbsTarget: z.number().optional(),
            fatTarget: z.number().optional(),
            startDate: z.coerce.date(),
            endDate: z.coerce.date().optional()
        })

        const {id} = paramsSchema.parse(request.params)
        const data = bodySchema.parse(request.body)

        const user_id = request.user.sub
        
        const mealPlanRepository = new MealPlanRepository()
        const service = new MealPlanService(mealPlanRepository)

        const mealPLan = await service.update(user_id, id, data)

        return reply.status(200).send(mealPLan)
    }
}