export interface MealRepository {
    create(data: CreateMealDTO): Promise<Meal>
    findManyByPatientId(patientId: string): Promise<Meal[]>
    findByPatientId(patientId: string): Promise<Meal[]>
    findByIdAndPatientId(id: string, patientId: string): Promise<Meal | null>
    update(id: string, data: UpdateMealDTO): Promise<Meal>
    delete(id: string): Promise<Meal>
}

export type Meal = {
    id: string
    name: string
    description?: string | null
    date: string
    time: string
    dateTime: Date
    isOnDiet: boolean
    patientProfileId: string
    mealPlanItemId?: string | null
    consumedCalories?: number | null
    consumedProtein?: number | null
    consumedCarbs?: number | null
    consumedFat?: number | null
}
export type CreateMealDTO = {
    name: string
    description?: string | null
    date: string
    time: string
    dateTime: Date
    isOnDiet: boolean
    patientProfileId: string
    mealPlanItemId?: string | null
    consumedCalories?: number | null
    consumedProtein?: number | null
    consumedCarbs?: number | null
    consumedFat?: number | null
}

export type UpdateMealDTO = {
    name: string
    description?: string
    date: string
    time: string
    isOnDiet: boolean
    consumedCalories?: number
    consumedProtein?: number
    consumedCarbs?: number
    consumedFat?: number
}