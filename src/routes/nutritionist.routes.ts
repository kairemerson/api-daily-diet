import { NutritionistController } from "../controllers/nutritionist.controller";
import { verifyJWT } from "../middlewares/verify-jwt";
import { PrismaNutritionistRepository } from "../repositories/nutritionist.repository";
import { FastifyInstance } from "fastify";


export async function NutritionistsRoutes(app: FastifyInstance) {
    const nutritionistRepository = new PrismaNutritionistRepository()
    const nutritionistController = new NutritionistController(nutritionistRepository)

    app.addHook("onRequest", verifyJWT)

    app.post("/nutritionists/profile", nutritionistController.register.bind(nutritionistController))
    app.get("/nutritionists/profile", nutritionistController.getNutritionist.bind(nutritionistController))
    app.put("/nutritionists/profile", nutritionistController.update.bind(nutritionistController))
}
