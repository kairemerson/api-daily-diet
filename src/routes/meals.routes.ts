import { MealsController } from "@/controllers/meals.controller";
import { verifyJWT } from "@/middlewares/verify-jwt";
import { FastifyInstance } from "fastify";


export async function MealsRoutes(app: FastifyInstance) {

    const mealsController = new MealsController()

    app.addHook("onRequest", verifyJWT)

    app.post("/meals", mealsController.create)
    app.get("/meals",  mealsController.list)
    app.get("/meals/:id", mealsController.get)
    app.put("/meals/:id", mealsController.update)
    app.delete("/meals/:id", mealsController.delete)
    app.get("/meals/metrics", mealsController.metrics)
}