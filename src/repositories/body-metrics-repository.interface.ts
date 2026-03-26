export interface BodyMetricsRepository {
    create(data: CreateBodyMetricsDTO): Promise<BodyMetrics>
    findByPatientId(patientId: string): Promise<BodyMetrics[]>
}

export interface CreateBodyMetricsDTO {
    patientId: string
    weight?: number
    bodyFat?: number
    muscleMass?: number  
    recordedAt?: Date
}

export interface BodyMetrics {
    id: string
    patientId: string
    weight?: number | null
    bodyFat?: number | null
    muscleMass?: number | null
    recordedAt?: Date | null
}

