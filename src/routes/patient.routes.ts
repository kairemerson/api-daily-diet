import { PatientController } from "../controllers/patient.controller";
import { verifyJWT } from "../middlewares/verify-jwt";
import { FastifyInstance } from "fastify";
import { PrismaPatientRepository } from "../repositories/patients.repository";

export async function PatientRoutes(app: FastifyInstance) {

    const patientRepository = new PrismaPatientRepository();
    const patientController = new PatientController(patientRepository);

    app.addHook("onRequest", verifyJWT)

    app.post("/patients", patientController.register.bind(patientController))
    app.get("/patients", patientController.list.bind(patientController))

    app.get("/patients/:patientId/dashboard", patientController.dashboard.bind(patientController))
    app.get("/patients/me/dashboard", patientController.patientDashboard.bind(patientController))
    app.patch("/patients/:id/status", patientController.updatePatientStatus.bind(patientController))
}