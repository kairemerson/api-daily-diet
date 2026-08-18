import { AppError } from "../../errors/app-error";
import { prisma } from "../../lib/prisma";
import { PatientRepository } from "../../repositories/patient-repository.interface";

export interface GetPatientProfileRequest {
    userId: string
}

export interface GetPatientProfileResponse {
    id: string;
    birthDate: Date | null;
    height: number | null;
    targetWeight: number | null;
    observation: string | null;
}

export class GetPatientProfileUseCase {
    constructor(private patientRepository: PatientRepository){}

    async execute(input: GetPatientProfileRequest): Promise<GetPatientProfileResponse> {
        const patient = await this.patientRepository.findById(input.userId)

        if (!patient) {
            throw new AppError("Paciente não encontrado.");
        }

        return patient
    }
}