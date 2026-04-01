import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod"
import { NutritionistRepository } from "../repositories/nutritionist-repository.interface";
import { CreateNutritionistUseCase } from "../use-cases/nutritionist/create-nutritionist.use-case";
import { GetNutritionistUseCase } from "../use-cases/nutritionist/get-nutritionist.use-case";
import { UpdateNutritionistUseCase } from "../use-cases/nutritionist/update-nutritionist.use-case";


export class NutritionistController {
    constructor(
        private nutritionistRepository: NutritionistRepository,
        private createNutritionistUseCase = new CreateNutritionistUseCase(nutritionistRepository),
        private getNutritionistUseCase = new GetNutritionistUseCase(nutritionistRepository),
        private updateNutritionistUseCase = new UpdateNutritionistUseCase(nutritionistRepository),
    ){}
    
    async register(request: FastifyRequest, reply: FastifyReply) {
        const bodySchema = z.object({
            crn: z.string(),
            specialty: z.string().optional(),
            clinic: z.string().optional(),
            phone: z.string().optional()
        })

        const {crn, clinic, phone, specialty} = bodySchema.parse(request.body)
        
        const userId = request.user.sub


        const nutritionistProfile = await this.createNutritionistUseCase.execute({
            userId,
            crn,
            clinic,
            phone,
            specialty
        })

        return reply.status(201).send({nutritionistProfile})
    }

    async getNutritionist(request: FastifyRequest, reply: FastifyReply) {
        const userId = request.user.sub

        const nutritionistProfile = await this.getNutritionistUseCase.execute(userId)

        return reply.status(200).send(nutritionistProfile)
    }

    async update(request: FastifyRequest, reply: FastifyReply) {

        const bodySchema = z.object({
            crn: z.string().min(2),
            specialty: z.string().optional(),
            clinic: z.string().optional(),
            phone: z.string().optional()
        })

        const {crn, clinic, phone, specialty} = bodySchema.parse(request.body)

        const userId = request.user.sub

        await this.updateNutritionistUseCase.execute({
            userId,
            crn,
            clinic,
            phone,
            specialty
        })

        return reply.status(201).send()
    }
}