import { MealsController } from "../controllers/meals.controller";
import { verifyJWT } from "../middlewares/verify-jwt";
import { PrismaMealsRepository } from "../repositories/meals.repository";
import { MealsService } from "../services/meals.service";
import { FastifyInstance } from "fastify";


export async function MealsRoutes(app: FastifyInstance) {

    const mealRepository = new PrismaMealsRepository()
    const mealService = new MealsService(mealRepository)
    const mealsController = new MealsController(mealService)

    app.addHook("onRequest", verifyJWT)

    app.post("/meals", mealsController.create.bind(mealsController))
    app.get("/meals",  mealsController.listByUserId.bind(mealsController))
    app.get("/meals/:id", mealsController.getById.bind(mealsController))
    app.get("/meals/patient/:patientId", mealsController.getByPatientId.bind(mealsController))
    app.put("/meals/:id", mealsController.update.bind(mealsController))
    app.delete("/meals/:id", mealsController.delete.bind(mealsController))
    // app.get("/meals/metrics", mealsController.metrics)
}