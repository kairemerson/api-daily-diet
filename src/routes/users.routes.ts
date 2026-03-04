import { FastifyInstance } from "fastify";
import { UsersController } from "@/controllers/users.controller";

export async function UsersRoutes(app: FastifyInstance) {

    const usersController = new UsersController()

    app.post("/users", usersController.register)
    app.post("/sessions", usersController.login)

}