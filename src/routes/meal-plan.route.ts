import { MealPlanController } from "../controllers/meal-plan.controller";
import { verifyJWT } from "../middlewares/verify-jwt";
import { FastifyInstance } from "fastify";
import { PrismaMealPlanRepository } from "../repositories/mealPlan.repository";


export async function MealPlanRoutes(app: FastifyInstance) {
    const mealPlanRepository = new PrismaMealPlanRepository()
    const mealPlanController = new MealPlanController(mealPlanRepository)

    app.addHook("onRequest", verifyJWT)

    app.post("/meal-plans", mealPlanController.create.bind(mealPlanController))
    app.get("/patients/:patientId/meal-plans", mealPlanController.findByPatienId.bind(mealPlanController))
    app.get("/meal-plans/:mealPlanId", mealPlanController.findById.bind(mealPlanController))
    app.put("/meal-plans/:id", mealPlanController.update.bind(mealPlanController))
}
