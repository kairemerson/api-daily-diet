import { FastifyReply, FastifyRequest } from "fastify";
import z from "zod";
import { MealPlanRepository } from "../repositories/meal-plan-repository.interface";
import { CreateMealPlanUseCase } from "../use-cases/meal-plan/create-meal-plan.use-case";
import { GetByPatientIdUseCase } from "../use-cases/meal-plan/get-by-patientId.use-case";
import { GetByIdUseCase } from "../use-cases/meal-plan/get-by-id.use-case";
import { UpdateMealPlanUseCase } from "../use-cases/meal-plan/update-meal-plan.use-case";

export class MealPlanController {

    constructor(
        private mealPlanRespository: MealPlanRepository,
        private createMealPlanUseCase = new CreateMealPlanUseCase(mealPlanRespository),
        private getByPatientIdUseCase = new GetByPatientIdUseCase(mealPlanRespository),
        private getByIdUseCase = new GetByIdUseCase(mealPlanRespository),
        private updateMealPlanUseCase = new UpdateMealPlanUseCase(mealPlanRespository)
    ){}

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

        const mealPlan = await this.createMealPlanUseCase.execute({adminUserId: user_id, ...data})

        return reply.status(201).send(mealPlan)
    }

    async findByPatienId(request: FastifyRequest, reply: FastifyReply) {
        const paramsSchema = z.object({
            patientId: z.string()
        })

        const {patientId} = paramsSchema.parse(request.params)

        const user_id = request.user.sub        

        const mealPlans = await this.getByPatientIdUseCase.execute({adminUserId: user_id, patientId})

        return reply.status(200).send(mealPlans)

    }

    async findById(request: FastifyRequest, reply: FastifyReply) {
        const paramsSchema = z.object({
            mealPlanId: z.string()
        })

        const {mealPlanId} = paramsSchema.parse(request.params)

        const user_id = request.user.sub        

        const mealPlans = await this.getByIdUseCase.execute({adminUserId: user_id, mealPlanId})

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
    

        const mealPLan = await this.updateMealPlanUseCase.execute(user_id, id, data)

        return reply.status(200).send(mealPLan)
    }
}