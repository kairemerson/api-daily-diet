import { FastifyReply, FastifyRequest } from "fastify";
import z from "zod";
import { MealPLanItemRepository } from "../repositories/meal-plan-item-repository.interface";
import { CreateMealPlanItemUseCase } from "../use-cases/meal-plan-item/create-meal-plan-item.use-case";
import { GetMealPlanItemUseCase } from "../use-cases/meal-plan-item/get-meal-plan-item.use-case";


export class MealPlanItemController {

    constructor(
        private mealPlanItemRepository: MealPLanItemRepository,
        private createMealPlanItemUseCase = new CreateMealPlanItemUseCase(mealPlanItemRepository),
        private getMealPlanItemUseCase = new GetMealPlanItemUseCase(mealPlanItemRepository)
    ){}

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

        const mealPlanItem = await this.createMealPlanItemUseCase.execute({
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

        const mealPlanItem = await this.getMealPlanItemUseCase.execute({mealPlanItemId, userId})

        return reply.status(200).send(mealPlanItem)
    }
}