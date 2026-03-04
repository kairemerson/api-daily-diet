import { MealPlanController } from "@/controllers/meal-plan.controller";
import { verifyJWT } from "@/middlewares/verify-jwt";
import { FastifyInstance } from "fastify";


export async function MealPlanRoutes(app: FastifyInstance) {
    const mealPlanController = new MealPlanController()

    app.addHook("onRequest", verifyJWT)

    app.post("/meal-plans", mealPlanController.create)
    app.get("/meal-plans/:patientId", mealPlanController.findByPatienId)
}
