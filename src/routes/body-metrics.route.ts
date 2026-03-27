import { BodyMetricsController } from "../controllers/body-metrics.controller";
import { verifyJWT } from "../middlewares/verify-jwt";
import { FastifyInstance } from "fastify";
import { PrismaBodyMetricsRepository } from "../repositories/body-metrics.repository";

export async function BodyMetricsRoutes(app: FastifyInstance) {
    const bodyMetricsRepository = new PrismaBodyMetricsRepository()
    const bodyMetricsController = new BodyMetricsController(bodyMetricsRepository)

    app.addHook("onRequest", verifyJWT)

    app.post("/body-metrics", bodyMetricsController.create.bind(bodyMetricsController))
    app.get("/body-metrics/:patientId", bodyMetricsController.getByPatientId.bind(bodyMetricsController))
}
