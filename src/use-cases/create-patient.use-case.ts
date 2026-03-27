
import { AppError } from "../errors/app-error";
import { PatientRepository } from "../repositories/patient-repository.interface";
import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs"

export interface CreateDataRequest {
  adminUserId: string;
  name: string;
  email: string;
  password: string;
  goal: "WEIGHT_LOSS" | "HYPERTROPHY" | "REEDUCATION" | "MAINTENANCE";
  birthDate?: Date;
  height?: number;
  targetWeight?: number;
  observation?: string;
}

export class CreatePatientUseCase {
  constructor(private patientRepository: PatientRepository) {}

  async execute(data: CreateDataRequest) {
    const admin = await this.getAdminWithNutritionist(data.adminUserId);

    const existingUser = await prisma.user.findUnique({
        where: { email: data.email }
    });

    if (existingUser) {
        throw new AppError("Usuário com este email já existe!");
    }

    const hashedPassword = await bcrypt.hash(data.password, 8);

    return this.patientRepository.create({
      user: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
      },
      profile: {
        nutritionistId: admin.nutritionistProfile?.id!,
        goal: data.goal,
        birthDate: data.birthDate,
        height: data.height,
        targetWeight: data.targetWeight,
        observation: data.observation,
      },
    });
  }

  private async getAdminWithNutritionist(adminUserId: string) {
    const admin = await prisma.user.findUnique({
      where: { id: adminUserId },
      include: { nutritionistProfile: true },
    });

    if (!admin || admin.role !== "ADMIN") {
      throw new AppError("Somente ADMIN pode criar pacientes!");
    }

    if (!admin.nutritionistProfile) {
      throw new AppError("Perfil do nutricionista não encontrado!");
    }

    return admin;
  }
}