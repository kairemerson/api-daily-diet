import { BodyMetricsRepository } from "@/repositories/body-metrics.repository";
import { BodyMetricsService } from "@/services/body-metrics.service";
import { FastifyReply, FastifyRequest } from "fastify";
import z from "zod";

export class BodyMetricsController {
    async create(request: FastifyRequest, reply: FastifyReply) {
        const bodySchema = z.object({
            patientId: z.string(),
            weight: z.number().optional(),
            bodyFat: z.number().optional(),
            muscleMass: z.number().optional(),
            recordedAt: z.coerce.date()
                .max(new Date(), "Data não pode ser futura")
                .optional()
        })
        .refine(data =>
            data.weight || data.bodyFat || data.muscleMass,
            { message: "Informe ao menos uma métrica." }
        )

        const data = bodySchema.parse(request.body)

        const user_id = request.user.sub

        const bodyMetricsRepository = new BodyMetricsRepository()
        const service = new BodyMetricsService(bodyMetricsRepository)

        const bodyMetric = await service.create({adminUserId: user_id, ...data})

        return reply.status(201).send(bodyMetric)
    }

    async fetchByPatientId(request: FastifyRequest, reply: FastifyReply){
        const paramsSchema = z.object({
            patientId: z.string()
        })

        const {patientId} = paramsSchema.parse(request.params)

        const user_id = request.user.sub

        const bodyMetricsRepository = new BodyMetricsRepository()
        const service = new BodyMetricsService(bodyMetricsRepository)

        const bodyMetrics = await service.fetchByPatientId(patientId, user_id)

        return reply.status(200).send(bodyMetrics)
    }
}