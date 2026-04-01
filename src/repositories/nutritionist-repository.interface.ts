

export interface NutritionistRepository {
    create(data: CreateNutritionistDTO): Promise<NutritionistProfile>
    findByUserId(userId: string): Promise<NutritionistProfile | null>
    updateNutritionist(nutritionistId: string, data: UpdateNutritionistDTO): Promise<void>
}

export type NutritionistProfile = {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    crn: string | null;
    specialty: string | null;
    clinic: string | null;
    phone: string | null;
}

export type CreateNutritionistDTO = {
  userId: string
  crn?: string
  specialty?: string
  clinic?: string
  phone?: string
}

export type UpdateNutritionistDTO = {
  crn?: string
  specialty?: string
  clinic?: string
  phone?: string
}

