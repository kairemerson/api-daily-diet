import { FastifyInstance } from "fastify";
import { UsersController } from "@/controllers/users.controller";
import { PrismaUserRepository } from "@/repositories/users.repository";
import { UserService } from "@/services/users.service";

export async function UsersRoutes(app: FastifyInstance) {

    const userRepository = new PrismaUserRepository()
    const userService = new UserService(userRepository)
    const usersController = new UsersController(userService)

    app.post("/users", usersController.register.bind(usersController))
    app.post("/sessions", usersController.login.bind(usersController))

}