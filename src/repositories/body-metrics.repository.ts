import { prisma } from "../lib/prisma"
import { BodyMetricsRepository, CreateBodyMetricsDTO } from "./body-metrics-repository.interface"

export class PrismaBodyMetricsRepository implements BodyMetricsRepository {
    async create(data: CreateBodyMetricsDTO) {
        return prisma.bodyMetrics.create({
            data
        })
    }

    async findByPatientId(patientId: string){
        return prisma.bodyMetrics.findMany({
            where: {
                patientId
            },
            orderBy: {
                recordedAt: "asc"
            }
        })
    }
}

