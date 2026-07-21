import fastify from "fastify";
import cors from "@fastify/cors"
import { env } from "./env";
import fastifyJwt from "@fastify/jwt";
import fastifyRawBody from "fastify-raw-body"

import { UsersRoutes } from "./routes/users.routes";
import { MealsRoutes } from "./routes/meals.routes";
import { NutritionistsRoutes } from "./routes/nutritionist.routes";
import { PatientRoutes } from "./routes/patient.routes";
import { MealPlanRoutes } from "./routes/meal-plan.route";
import { BodyMetricsRoutes } from "./routes/body-metrics.route";
import { MealPlanItemRoutes } from "./routes/meal-plan-item.route";

import { plansRoutes } from "./routes/plans.js";
import { subscriptionsRoutes } from "./routes/subscriptions.js";
import { stripeWebhook } from "./routes/webhook.js";



export const app = fastify()

app.register(cors, {
  origin: true,
})
app.register(fastifyJwt, {
    secret: env.JWT_SECRET
})

app.register(fastifyRawBody, {
  field: "rawBody",
  global: false, // só nas rotas que pedirem explicitamente
  runFirst: true,
})

app.register(UsersRoutes)
app.register(MealsRoutes)
app.register(NutritionistsRoutes)
app.register(PatientRoutes)
app.register(MealPlanRoutes)
app.register(MealPlanItemRoutes)
app.register(BodyMetricsRoutes)

app.register(plansRoutes)
app.register(subscriptionsRoutes)
app.register(stripeWebhook)