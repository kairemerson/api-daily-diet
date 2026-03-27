import { MealPlanItemController } from "../controllers/meal-plan-item.controller";
import { verifyJWT } from "../middlewares/verify-jwt";
import { FastifyInstance } from "fastify";
import { PrismaMealPLanItemRepository } from "../repositories/meal-plan-item.respository";


export async function MealPlanItemRoutes(app: FastifyInstance) {
    
    const mealPlanItemRepository = new PrismaMealPLanItemRepository()
    const mealPlanItemController = new MealPlanItemController(mealPlanItemRepository)

    app.addHook("onRequest", verifyJWT)

    app.post("/meal-plan-items", mealPlanItemController.create.bind(mealPlanItemController))
    app.get("/meal-plan-items/:mealPlanItemId", mealPlanItemController.getMealPlanItemByIdRequest.bind(mealPlanItemController))
}
