import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod"
import { CreatePatientUseCase } from "../use-cases/create-patient.use-case";
import { GetPatientDashboardUseCase } from "../use-cases/get-patient-dashboard.use-case";
import { GetPatientOwnDashboardUseCase } from "../use-cases/get-patient-own-dashboard.use-case";
import { ListPatientByNutritionistUseCase } from "../use-cases/list-patient-by-nutritionist.use-case";
import { UpdatePatientStatusUseCase } from "../use-cases/update-patient-status.use-case";
import { PrismaPatientRepository } from "../repositories/patients.repository";


export class PatientController {
    constructor(
        private patientRepository: PrismaPatientRepository,
        private createPatientUseCase = new CreatePatientUseCase(patientRepository),
        private listPatientByNutritionistUseCase = new ListPatientByNutritionistUseCase(patientRepository),
        private getPatientDashboardUseCase = new GetPatientDashboardUseCase(patientRepository),
        private getPatientOwnDashboardUseCase = new GetPatientOwnDashboardUseCase(patientRepository),
        private updatePatientStatusUseCase = new UpdatePatientStatusUseCase(patientRepository)
    ) {}

    async register(request: FastifyRequest, reply: FastifyReply) {
        const bodySchema = z.object({
            name: z.string(),
            email: z.string().email(),
            password: z.string().min(6),
            goal: z.enum([
                "WEIGHT_LOSS",
                "HYPERTROPHY",
                "REEDUCATION",
                "MAINTENANCE"
            ]),
            birthDate: z.string().optional(),
            height: z.number().optional(),
            targetWeight: z.number().optional(),
            observation: z.string().optional()
        })

        const data = bodySchema.parse(request.body)       

        await this.createPatientUseCase.execute({
            adminUserId: request.user.sub,
            ...data,
            birthDate: data.birthDate ? new Date(data.birthDate) : undefined
        })

        return reply.status(201).send()
    }

    async list(request: FastifyRequest, reply: FastifyReply){
        const userId = request.user.sub

        const patients = await this.listPatientByNutritionistUseCase.execute({userId})

        return reply.status(200).send(patients)

    }

    async dashboard(request: FastifyRequest, reply: FastifyReply){
        
        const paramsSchema = z.object({
            patientId: z.string()
        })

        const {patientId} = paramsSchema.parse(request.params)

        const adminUserId = request.user.sub        

        const dashboard = await this.getPatientDashboardUseCase.execute({
            adminUserId, patientId
        })

        return reply.status(200).send(dashboard)

    }

    async patientDashboard(request: FastifyRequest, reply: FastifyReply){
        

        const userId = request.user.sub                

        const dashboard = await this.getPatientOwnDashboardUseCase.execute({
            userId
        })

        return reply.status(200).send(dashboard)

    }

    async updatePatientStatus(request: FastifyRequest, reply: FastifyReply){
        
        const paramsSchema = z.object({
            id: z.string().uuid()
        })

        const bodySchema = z.object({
            status: z.enum(["ACTIVE", "INACTIVE", "PAUSED"])
        })

        const {id} = paramsSchema.parse(request.params)
        const {status} = bodySchema.parse(request.body)

        const adminUserId = request.user.sub                

        await this.updatePatientStatusUseCase.execute({
            adminUserId,
            patientId: id,
            status
        })

        return reply.status(204).send()

    }

}