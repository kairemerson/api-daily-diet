import { MealPlanItemController } from "../controllers/meal-plan-item.controller";
import { verifyJWT } from "../middlewares/verify-jwt";
import { FastifyInstance } from "fastify";


export async function MealPlanItemRoutes(app: FastifyInstance) {
    const mealPlanItemController = new MealPlanItemController()

    app.addHook("onRequest", verifyJWT)

    app.post("/meal-plan-items", mealPlanItemController.create)
    app.get("/meal-plan-items/:mealPlanItemId", mealPlanItemController.getMealPlanItemByIdRequest)
}
