import { Goal, PatientStatus, Prisma, Role } from "@prisma/client"

export interface PatientRepository {
    create(data: CreatePatientDTO): Promise<UserWithPatientProfile>
    findManyWithAdherenceByNutritionistId(nutritionistId: string): Promise<PatientAdherenceDashboard>
    updatePatientStatus(patientId: string, status: PatientStatus): Promise<void>
    findById(userId: string): Promise<PatientProfile | null>
    updateUserAndPatientProfile(userId: string, data: UpdateUserPatientProfileDTO): Promise<UserWithPatientProfile>
}

export interface CreatePatientDTO {
  user: {
    name: string
    email: string
    password: string
  }
  profile: {
    nutritionistId: string
    goal: "WEIGHT_LOSS" | "HYPERTROPHY" | "REEDUCATION" | "MAINTENANCE"
    birthDate?: Date
    height?: number
    targetWeight?: number
    observation?: string
  }
}

export type UserWithPatientProfile = {
    user: {
        id: string;
        name: string;
        email: string;
        role: Role;
    };
    profile: {
        id: string;
        userId: string;
        nutritionistId: string;
        status: PatientStatus;
        goal: Goal;
        birthDate: Date | null;
        height: number | null;
        targetWeight: number | null;
        observation: string | null;
        createdAt: Date;
        updatedAt: Date;
    };
} 

export type PatientAdherencePatient = {
  user: {
    id: string;
    name: string;
    email: string;
  };
  mealPlans: { id: string }[];
} & {
  id: string;
  userId: string;
  nutritionistId: string;
  status: PatientStatus;
  goal: Goal;
  birthDate: Date | null;
  height: number | null;
  targetWeight: number | null;
  observation: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type MealStatsByPatient = Prisma.PickEnumerable<
  Prisma.MealGroupByOutputType,
  ["patientProfileId", "isOnDiet"]
> & {
  _count: number;
};

export type LastActivityByPatient = Prisma.PickEnumerable<
  Prisma.MealGroupByOutputType,
  ["patientProfileId"]
> & {
  _max: {
    dateTime: Date | null;
  };
};

export type PatientAdherenceDashboard = {
  patients: PatientAdherencePatient[];
  mealStats: MealStatsByPatient[];
  lastActivity: LastActivityByPatient[];
};

export type PatientProfile = {
  id: string;
  birthDate: Date | null;
  height: number | null;
  targetWeight: number | null;
  observation: string | null;

}

export interface UpdateUserPatientProfileDTO {
  name?: string
  email?: string
  birthDate?: Date | null
  height?: number | null
  targetWeight?: number | null
}