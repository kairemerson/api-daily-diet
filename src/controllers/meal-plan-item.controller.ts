import { MealPLanItemRepository } from "@/repositories/meal-plan-item.respository";
import { MealPlanItemService } from "@/services/meal-plan-item.service";
import { FastifyReply, FastifyRequest } from "fastify";
import z from "zod";


export class MealPlanItemController {
    async create(request: FastifyRequest, reply: FastifyReply) {
        
        const bodySchema = z.object({
            mealPlanId: z.string(),
            name: z.string(),
            description: z.string().optional(),
            order: z.number().int(),
            time: z.string(),
            targetCalories: z.number().optional(),
            targetProtein: z.number().optional(),
            targetCarbs: z.number().optional(),
            targetFat: z.number().optional(),
        })

        const data = bodySchema.parse(request.body)

        const adminUserId = request.user.sub

        const mealPlanItemRepository = new MealPLanItemRepository()
        const service = new MealPlanItemService(mealPlanItemRepository)

        const mealPlanItem = await service.create({
            adminUserId,
            ...data
        })

        return reply.status(201).send(mealPlanItem)
    }

    async getMealPlanItemByIdRequest(request: FastifyRequest, reply: FastifyReply) {
        
        const paramsSchema = z.object({
            mealPlanItemId: z.string()
        })

        const {mealPlanItemId} = paramsSchema.parse(request.params)

        const userId = request.user.sub        

        const mealPlanItemRepository = new MealPLanItemRepository()
        const service = new MealPlanItemService(mealPlanItemRepository)

        const mealPlanItem = await service.getMealPlanItemByIdRequest(mealPlanItemId, userId)

        return reply.status(200).send(mealPlanItem)
    }
}