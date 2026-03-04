import { NutritionistController } from "@/controllers/nutritionist.controller";
import { verifyJWT } from "@/middlewares/verify-jwt";
import { FastifyInstance } from "fastify";


export async function NutritionistsRoutes(app: FastifyInstance) {
    const nutritionistController = new NutritionistController()

    app.addHook("onRequest", verifyJWT)

    app.post("/nutritionists/profile", nutritionistController.register)
}
