import { AppError } from "../../errors/app-error";
import { PatientRepository } from "../../repositories/patient-repository.interface";

interface UpdatePatientProfileRequest {
  userId: string
  name?: string
  email?: string
  birthDate?: string | null
  height?: number | null
  targetWeight?: number | null
}

export class UpdatePatientProfileUseCase {
    constructor(private patientRepository: PatientRepository) {}

    async execute({userId, name, email, birthDate, height, targetWeight}: UpdatePatientProfileRequest) {
        const patientExists = await this.patientRepository.findById(userId)

        if (!patientExists) {
            throw new AppError("Paciente não encontrado ou sem permissão de acesso.", 404)
        }

        // 2. Tratamento de regras de negócio de formato (ex: converter string para Date)
        const parsedBirthDate = birthDate ? new Date(birthDate) : birthDate === null ? null : undefined

        // 3. Executa a atualização atômica via repositório
        const updatedPatient = await this.patientRepository.updateUserAndPatientProfile(
            userId,
            {
                name,
                email,
                birthDate: parsedBirthDate,
                height,
                targetWeight,
            }
        )

        return updatedPatient
    }
    
}