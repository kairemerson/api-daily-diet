import { MealsRepository } from "@/repositories/meals.repository";

interface CreateMealRequest {
  name: string
  description?: string
  date: Date
  isOnDiet: boolean
  userId: string
}

interface UpdateMealRequest {
  name: string
  description?: string
  date: Date
  isOnDiet: boolean
}



export class MealsService {
    constructor(private mealsRepository: MealsRepository) {}

    async create(data: CreateMealRequest){
        return this.mealsRepository.create(data)
    }

    async listByUser(userId: string) {
        return this.mealsRepository.findManyByUserId(userId)
    }

    async getById(id: string, userId: string) {
        const meal = await this.mealsRepository.findByIdAndUserId(id, userId)
        
        if(!meal) {
            throw new Error("Meal not found")
        }

        return meal
    }

    async update(id: string, userId: string, data: UpdateMealRequest) {
        const meal = await this.mealsRepository.findByIdAndUserId(id, userId)

        if(!meal) {
            throw new Error("Meal not found")
        }

        return this.mealsRepository.update(id, data)
    }

    async delete(id: string, userId: string){
        const meal = await this.mealsRepository.findByIdAndUserId(id, userId)

        if(!meal) {
            throw new Error("Meal not found")
        }

        await this.mealsRepository.delete(id)
    }
}