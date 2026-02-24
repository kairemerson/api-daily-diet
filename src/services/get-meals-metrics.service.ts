import { MealsRepository } from "@/repositories/meals.repository"

interface MetricsResponse {
  total: number
  totalOnDiet: number
  totalOffDiet: number
  bestSequence: number
  percentageOnDiet: number
}

export class GetMealsMetricsService {
    constructor(private mealsRepository: MealsRepository) {}

    async execute(userId: string): Promise<MetricsResponse> {
        const meals = await this.mealsRepository.findManyByUserId(userId)

        const total = meals.length
        const totalOnDiet = meals.filter((meal) => meal.isOnDiet).length
        const totalOffDiet = meals.filter((meal) => !meal.isOnDiet).length

        let bestSequence = 0
        let currentSequence = 0

        for (const meal of meals) {
            if(meal.isOnDiet) {
                currentSequence++
                if(currentSequence > bestSequence) {
                    bestSequence = currentSequence
                }
            } else {
                currentSequence = 0
            }
        }

        const percentageOnDiet =
            total > 0 ? Number(((totalOnDiet / total) * 100).toFixed(2)) : 0

        return {
            total,
            totalOnDiet,
            totalOffDiet,
            bestSequence,
            percentageOnDiet
        }
    }
}