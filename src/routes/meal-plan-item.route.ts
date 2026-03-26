import { MealPlanItemController } from "../controllers/meal-plan-item.controller";
import { verifyJWT } from "../middlewares/verify-jwt";
import { FastifyInstance } from "fastify";
import { PrismaMealPLanItemRepository } from "../repositories/meal-plan-item.respository";
import { MealPlanItemService } from "../services/meal-plan-item.service";


export async function MealPlanItemRoutes(app: FastifyInstance) {
    
    const mealPlanItemRepository = new PrismaMealPLanItemRepository()
    const mealPlanItemService = new MealPlanItemService(mealPlanItemRepository)
    const mealPlanItemController = new MealPlanItemController(mealPlanItemService)

    app.addHook("onRequest", verifyJWT)

    app.post("/meal-plan-items", mealPlanItemController.create.bind(mealPlanItemController))
    app.get("/meal-plan-items/:mealPlanItemId", mealPlanItemController.getMealPlanItemByIdRequest.bind(mealPlanItemController))
}
