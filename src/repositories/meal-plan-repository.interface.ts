
export interface MealPlanRepository {
    create(data: CreateMealPlanDTO): Promise<MealPlan>
    findByPatientId(patientId: string): Promise<MealPlanWithMealPlanItems[]>
    findById(mealPlanId: string): Promise<MealPlanWithMealPlanItems>
    update(mealPlanId: string, data: UpdateMealPlan): Promise<MealPlan>
}

export interface CreateMealPlanDTO {
  patientId: string
  title: string
  description?: string
  caloriesTarget?: number
  proteinTarget?: number
  carbsTarget?: number
  fatTarget?: number
  startDate: Date
  endDate?: Date
}

export type UpdateMealPlan = {
  title: string
  description?: string
  caloriesTarget?: number
  proteinTarget?: number
  carbsTarget?: number
  fatTarget?: number
  startDate: Date
  endDate?: Date
}

export type MealPlan = {
    id: string;
    patientId: string;
    title: string;
    description: string | null;
    caloriesTarget: number | null;
    proteinTarget: number | null;
    carbsTarget: number | null;
    fatTarget: number | null;
    startDate: Date;
    endDate: Date | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export type MealPlanItem = {
    id: string;
    name: string;
    description: string | null;
    time: string;
    mealPlanId: string;
    targetCalories: number | null;
    targetProtein: number | null;
    targetCarbs: number | null;
    targetFat: number | null;
}

export type MealPlanWithMealPlanItems = MealPlan & {
    mealPlanItems: MealPlanItem[]
}