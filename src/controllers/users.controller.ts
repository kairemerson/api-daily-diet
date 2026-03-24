import { UserService } from "@/services/users.service";
import { FastifyReply, FastifyRequest } from "fastify";
import {z} from "zod"

export class UsersController {

    constructor(private userService: UserService){}

    async register(request: FastifyRequest, reply: FastifyReply) {
        const bodySchema = z.object({
            name: z.string(),
            email: z.email(),
            password: z.string().min(6),
            role: z.enum(["ADMIN", "PATIENT"]).default("ADMIN")
        })

        const {name, email, password, role} = bodySchema.parse(request.body)

        await this.userService.register({name, email, password, role})

        return reply.status(201).send()
    }

    async login(request: FastifyRequest, reply: FastifyReply) {
        const bodySchema = z.object({
            email: z.email(),
            password: z.string().min(6)
        })

        const {email, password} = bodySchema.parse(request.body)

        const user = await this.userService.login(email, password)

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