import fastify from "fastify";
import cors from "@fastify/cors"
import { env } from "./env";
import fastifyJwt from "@fastify/jwt";
import { UsersRoutes } from "./routes/users.routes";
import { MealsRoutes } from "./routes/meals.routes";
import { NutritionistsRoutes } from "./routes/nutritionist.routes";
import { PatientRoutes } from "./routes/patient.routes";
import { MealPlanRoutes } from "./routes/meal-plan.route";
import { BodyMetricsRoutes } from "./routes/body-metrics.route";
import { MealPlanItemRoutes } from "./routes/meal-plan-item.route";



export const app = fastify()

app.register(cors)
app.register(fastifyJwt, {
    secret: env.JWT_SECRET
})

app.register(UsersRoutes)
app.register(MealsRoutes)
app.register(NutritionistsRoutes)
app.register(PatientRoutes)
app.register(MealPlanRoutes)
app.register(MealPlanItemRoutes)
app.register(BodyMetricsRoutes)