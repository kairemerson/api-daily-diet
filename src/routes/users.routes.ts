import { FastifyInstance } from "fastify";
import { UsersController } from "../controllers/users.controller";
import { PrismaUserRepository } from "../repositories/users.repository";

export async function UsersRoutes(app: FastifyInstance) {

    const userRepository = new PrismaUserRepository()
    const usersController = new UsersController(userRepository)

    app.post("/users", usersController.register.bind(usersController))
    app.post("/sessions", usersController.login.bind(usersController))

}