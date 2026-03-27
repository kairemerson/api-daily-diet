import { FastifyReply, FastifyRequest } from "fastify";
import {z} from "zod"
import { CreateUserUseCase } from "../use-cases/users/create-user.use-case";
import { UserRepository } from "../repositories/user-repository.interface";
import { LoginUserUseCase } from "../use-cases/users/login-user.use-case";

export class UsersController {

    constructor(
        private userRepository: UserRepository,
        private createUserUseCase = new CreateUserUseCase(userRepository),
        private loginUserUseCase = new LoginUserUseCase(userRepository),
    ){}

    async register(request: FastifyRequest, reply: FastifyReply) {
        const bodySchema = z.object({
            name: z.string(),
            email: z.email(),
            password: z.string().min(6),
            role: z.enum(["ADMIN", "PATIENT"]).default("ADMIN")
        })

        const {name, email, password, role} = bodySchema.parse(request.body)

        await this.createUserUseCase.execute({name, email, password, role})

        return reply.status(201).send()
    }

    async login(request: FastifyRequest, reply: FastifyReply) {
        const bodySchema = z.object({
            email: z.email(),
            password: z.string().min(6)
        })

        const {email, password} = bodySchema.parse(request.body)

        const user = await this.loginUserUseCase.execute({email, password})

        const token = await reply.jwtSign(
            {
                role: user.role
            },
            {
                sub: user.id,
                expiresIn: "7d"
            }
        )

        return reply.send({token, user})

    }
}