import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod"
import { CreatePatientUseCase } from "../use-cases/patient/create-patient.use-case";
import { GetPatientDashboardUseCase } from "../use-cases/patient/get-patient-dashboard.use-case";
import { GetPatientOwnDashboardUseCase } from "../use-cases/patient/get-patient-own-dashboard.use-case";
import { ListPatientByNutritionistUseCase } from "../use-cases/patient/list-patient-by-nutritionist.use-case";
import { UpdatePatientStatusUseCase } from "../use-cases/patient/update-patient-status.use-case";
import { PrismaPatientRepository } from "../repositories/patients.repository";
import { PrismaBodyMetricsRepository } from "../repositories/body-metrics.repository";
import { GetPatientProfileUseCase } from "../use-cases/patient/get-patient-profile.use-case";
import { UpdatePatientProfileUseCase } from "../use-cases/patient/update-patient-profile.use-case";


export class PatientController {
    private createPatientUseCase: CreatePatientUseCase;
    private listPatientByNutritionistUseCase: ListPatientByNutritionistUseCase;
    private getPatientDashboardUseCase: GetPatientDashboardUseCase;
    private getPatientOwnDashboardUseCase: GetPatientOwnDashboardUseCase;
    private updatePatientStatusUseCase: UpdatePatientStatusUseCase;
    private getPatientProfileUseCase: GetPatientProfileUseCase;
    private updatePatientProfileUseCase: UpdatePatientProfileUseCase;

  constructor(
    private patientRepository: PrismaPatientRepository,
    private bodyMetricsRepository: PrismaBodyMetricsRepository
    ) {
        this.createPatientUseCase = new CreatePatientUseCase(this.patientRepository);
        this.listPatientByNutritionistUseCase = new ListPatientByNutritionistUseCase(this.patientRepository);
        this.getPatientDashboardUseCase = new GetPatientDashboardUseCase(
        this.patientRepository,
        this.bodyMetricsRepository
        );
        this.getPatientOwnDashboardUseCase = new GetPatientOwnDashboardUseCase(this.patientRepository);
        this.updatePatientStatusUseCase = new UpdatePatientStatusUseCase(this.patientRepository);
        this.getPatientProfileUseCase = new GetPatientProfileUseCase(this.patientRepository);
        this.updatePatientProfileUseCase = new UpdatePatientProfileUseCase(this.patientRepository);
    }

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

    async getPatientProfile(request: FastifyRequest, reply: FastifyReply) {
        const userId = request.user.sub

        const patientProfile = await this.getPatientProfileUseCase.execute({
            userId
        })

        return reply.status(200).send(patientProfile)
    }

    async updatePatientProfile(request: FastifyRequest, reply: FastifyReply) {

        const bodySchema = z.object({
            name: z.string(),
            email: z.string().email(),
            birthDate: z.string().optional(),
            height: z.number().optional(),
            targetWeight: z.number().optional(),
        })
        
        const {name, email, birthDate, height, targetWeight} = bodySchema.parse(request.body)     

        const userId = request.user.sub

        const patientProfile = await this.updatePatientProfileUseCase.execute({
            userId,
            name,
            email,
            birthDate,
            height,
            targetWeight
        })

        return reply.status(200).send(patientProfile)

    }

}