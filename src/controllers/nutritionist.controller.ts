import { NutritionistRepository } from "@/repositories/nutritionist.repository";
import { NutritionistProfileService } from "@/services/nutritionist.service";
import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod"


export class NutritionistController {
    async register(request: FastifyRequest, reply: FastifyReply) {
        const bodySchema = z.object({
            crn: z.string(),
            specialty: z.string().optional(),
            clinic: z.string().optional(),
            phone: z.string().optional()
        })

        const {crn, clinic, phone, specialty} = bodySchema.parse(request.body)
        
        const userId = request.user.sub

        const repository = new NutritionistRepository()
        const service = new NutritionistProfileService(repository)

        await service.execute({
            userId,
            crn,
            clinic,
            phone,
            specialty
        })

        return reply.status(201).send()
    }
}