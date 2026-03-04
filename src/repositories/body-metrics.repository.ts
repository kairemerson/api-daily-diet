import { prisma } from "@/lib/prisma"

interface CreateBodyMetricsData {
    patientId: string
    weight?: number
    bodyFat?: number
    muscleMass?: number  
    recordedAt?: Date
}


export class BodyMetricsRepository {
    async create(data: CreateBodyMetricsData) {
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

