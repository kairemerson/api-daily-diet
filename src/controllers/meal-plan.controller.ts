import { MealPlanRepository } from "@/repositories/mealPlan.repository";
import { MealPlanService } from "@/services/meal-plan.service";
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
}