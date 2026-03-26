
export interface MealPlanRepository {
    create(data: CreateMealPlanDTO): Promise<MealPlan>
    findByPatientId(patientId: string): Promise<MealPlansWithMealPlanItems>
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
    patientId: string;
}

export type MealPlanItem = {
    id: string;
    name: string;
    createdAt: Date;
    description: string | null;
    time: string;
    mealPlanId: string;
    order: number;
    targetCalories: number | null;
    targetProtein: number | null;
    targetCarbs: number | null;
    targetFat: number | null;
}

export type MealPlansWithMealPlanItems = {
    mealPlan: MealPlan
    mealPlanItems: MealPlanItem[]
}[]

export type MealPlanWithMealPlanItems = {
    mealPlan: MealPlan
    mealPlanItems: MealPlanItem[]
}