import { NutritionistController } from "@/controllers/nutritionist.controller";
import { verifyJWT } from "@/middlewares/verify-jwt";
import { PrismaNutritionistRepository } from "@/repositories/nutritionist.repository";
import { NutritionistProfileService } from "@/services/nutritionist.service";
import { FastifyInstance } from "fastify";


export async function NutritionistsRoutes(app: FastifyInstance) {
    const nutritionistRepository = new PrismaNutritionistRepository()
    const nutritionistService = new NutritionistProfileService(nutritionistRepository)
    const nutritionistController = new NutritionistController(nutritionistService)

    app.addHook("onRequest", verifyJWT)

    app.post("/nutritionists/profile", nutritionistController.register.bind(nutritionistController))
}
