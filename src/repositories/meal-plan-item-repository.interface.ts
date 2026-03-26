export interface MealPLanItemRepository {
    create(data: CreateMealPlanItemDTO): Promise<MealPlanItem>
    findMealPlanItemById(mealPlanItemId: string): Promise<MealPlanItem | null>
}


export interface CreateMealPlanItemDTO {
    mealPlanId: string
    name: string
    description?: string
    order: number
    time: string
    targetCalories?: number
    targetProtein?: number
    targetCarbs?: number
    targetFat?: number
}

export type MealPlanItem = {
    id: string;
    name: string;
    createdAt: Date;
    description: string | null;
    order: number;
    time: string;
    targetCalories: number | null;
    targetProtein: number | null;
    targetCarbs: number | null;
    targetFat: number | null;
    mealPlanId: string;
}