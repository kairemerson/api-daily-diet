import { PatientController } from "../controllers/patient.controller";
import { verifyJWT } from "../middlewares/verify-jwt";
import { FastifyInstance } from "fastify";


export async function PatientRoutes(app: FastifyInstance) {
    const patientController = new PatientController()

    app.addHook("onRequest", verifyJWT)

    app.post("/patients", patientController.register)
    app.get("/patients", patientController.list)

    app.get("/patients/:patientId/dashboard", patientController.dashboard)
    app.get("/patients/me/dashboard", patientController.patientDashboard)
    app.patch("/patients/:id/status", patientController.updatePatientStatus)
}