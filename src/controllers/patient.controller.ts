import { PatientRepository } from "../repositories/patients.repository";
import { PatientProfileService } from "../services/patient.service";
import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod"


export class PatientController {
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
        

        const repository = new PatientRepository()
        const service = new PatientProfileService(repository)

        await service.execute({
            adminUserId: request.user.sub,
            ...data,
            birthDate: data.birthDate ? new Date(data.birthDate) : undefined
        })

        return reply.status(201).send()
    }

    async list(request: FastifyRequest, reply: FastifyReply){
        const userId = request.user.sub

        const repository = new PatientRepository()
        const service = new PatientProfileService(repository)

        const patients = await service.listByUser(userId)

        return reply.status(200).send(patients)

    }

    async dashboard(request: FastifyRequest, reply: FastifyReply){
        
        const paramsSchema = z.object({
            patientId: z.string()
        })

        const {patientId} = paramsSchema.parse(request.params)

        const adminUserId = request.user.sub        

        const repository = new PatientRepository()
        const service = new PatientProfileService(repository)

        const dashboard = await service.getDashboard({
            adminUserId, patientId
        })

        return reply.status(200).send(dashboard)

    }

    async patientDashboard(request: FastifyRequest, reply: FastifyReply){
        

        const userId = request.user.sub                

        const repository = new PatientRepository()
        const service = new PatientProfileService(repository)

        const dashboard = await service.getPatientDashboard({
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

        const repository = new PatientRepository()
        const service = new PatientProfileService(repository)

        await service.updatePatientStatus({
            adminUserId,
            patientId: id,
            status
        })

        return reply.status(204).send()

    }


}