import fastify from "fastify";
import cors from "@fastify/cors"
import { env } from "./env";
import fastifyJwt from "@fastify/jwt";
import { UsersRoutes } from "./routes/users.routes";



export const app = fastify()

app.register(cors)
app.register(fastifyJwt, {
    secret: env.JWT_SECRET
})

app.register(UsersRoutes)
// app.register(mealsRoutes)