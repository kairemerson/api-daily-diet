import { MealsController } from "../controllers/meals.controller";
import { verifyJWT } from "../middlewares/verify-jwt";
import { PrismaMealsRepository } from "../repositories/meals.repository";
import { FastifyInstance } from "fastify";


export async function MealsRoutes(app: FastifyInstance) {

    const mealRepository = new PrismaMealsRepository()
    const mealsController = new MealsController(mealRepository)

    app.addHook("onRequest", verifyJWT)

    app.post("/meals", mealsController.create.bind(mealsController))
    app.get("/meals",  mealsController.listByUserId.bind(mealsController))
    app.get("/meals/:id", mealsController.getById.bind(mealsController))
    app.get("/meals/patient/:patientId", mealsController.getByPatientId.bind(mealsController))
    app.put("/meals/:id", mealsController.update.bind(mealsController))
    app.delete("/meals/:id", mealsController.delete.bind(mealsController))
    // app.get("/meals/metrics", mealsController.metrics)
}