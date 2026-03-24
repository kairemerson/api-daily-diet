import { BodyMetricsController } from "../controllers/body-metrics.controller";
import { verifyJWT } from "../middlewares/verify-jwt";
import { FastifyInstance } from "fastify";


export async function BodyMetricsRoutes(app: FastifyInstance) {
    const bodyMetricsController = new BodyMetricsController()

    app.addHook("onRequest", verifyJWT)

    app.post("/body-metrics", bodyMetricsController.create)
    app.get("/body-metrics/:patientId", bodyMetricsController.fetchByPatientId)
}
