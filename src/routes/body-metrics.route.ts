import { BodyMetricsController } from "../controllers/body-metrics.controller";
import { verifyJWT } from "../middlewares/verify-jwt";
import { FastifyInstance } from "fastify";
import { PrismaBodyMetricsRepository } from "../repositories/body-metrics.repository";
import { BodyMetricsService } from "../services/body-metrics.service";


export async function BodyMetricsRoutes(app: FastifyInstance) {
    const bodyMetricsRepository = new PrismaBodyMetricsRepository()
    const bodyMetricsService = new BodyMetricsService(bodyMetricsRepository)
    const bodyMetricsController = new BodyMetricsController(bodyMetricsService)

    app.addHook("onRequest", verifyJWT)

    app.post("/body-metrics", bodyMetricsController.create.bind(bodyMetricsController))
    app.get("/body-metrics/:patientId", bodyMetricsController.fetchByPatientId.bind(bodyMetricsController))
}
