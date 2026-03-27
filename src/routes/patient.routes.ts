import { PatientController } from "../controllers/patient.controller";
import { verifyJWT } from "../middlewares/verify-jwt";
import { FastifyInstance } from "fastify";
import { PrismaPatientRepository } from "../repositories/patients.repository";
import { PatientProfileService } from "../services/patient.service";
import { CreatePatientUseCase } from "../use-cases/create-patient.use-case";
import { ListPatientByNutritionistUseCase } from "../use-cases/list-patient-by-nutritionist.use-case";


export async function PatientRoutes(app: FastifyInstance) {

    const patientRepository = new PrismaPatientRepository()

    const createPatientUseCase = new CreatePatientUseCase(patientRepository)
    const listPatientByNutritionistUseCase = new ListPatientByNutritionistUseCase(patientRepository)

    const patientService = new PatientProfileService(
        createPatientUseCase,
        listPatientByNutritionistUseCase,
        patientRepository
    )
    
    const patientController = new PatientController(patientService)

    app.addHook("onRequest", verifyJWT)

    app.post("/patients", patientController.register.bind(patientController))
    app.get("/patients", patientController.list.bind(patientController))

    app.get("/patients/:patientId/dashboard", patientController.dashboard.bind(patientController))
    app.get("/patients/me/dashboard", patientController.patientDashboard.bind(patientController))
    app.patch("/patients/:id/status", patientController.updatePatientStatus.bind(patientController))
}