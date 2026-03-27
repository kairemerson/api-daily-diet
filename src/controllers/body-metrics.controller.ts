import { FastifyReply, FastifyRequest } from "fastify";
import z from "zod";
import { BodyMetricsRepository } from "../repositories/body-metrics-repository.interface";
import { CreateBodyMetricsUseCase } from "../use-cases/body-metrics/create-body-metrics.use-case";
import { GetBodyMetricsByPatientIdUseCase } from "../use-cases/body-metrics/get-body-metrics-by-patientId.use-case";

export class BodyMetricsController {

    constructor(
        private bodyMetricsRepository: BodyMetricsRepository,
        private createBodyMetricsUseCase = new CreateBodyMetricsUseCase(bodyMetricsRepository),
        private getBodyMetricsByPatientIdUseCase = new GetBodyMetricsByPatientIdUseCase(bodyMetricsRepository),
    ){}

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

        const bodyMetric = await this.createBodyMetricsUseCase.execute({adminUserId: user_id, ...data})

        return reply.status(201).send(bodyMetric)
    }

    async getByPatientId(request: FastifyRequest, reply: FastifyReply){
        const paramsSchema = z.object({
            patientId: z.string()
        })

        const {patientId} = paramsSchema.parse(request.params)

        const user_id = request.user.sub

        const bodyMetrics = await this.getBodyMetricsByPatientIdUseCase.execute({patientId, adminUserId:user_id})

        return reply.status(200).send(bodyMetrics)
    }
}