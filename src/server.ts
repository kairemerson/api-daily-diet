import { app } from "./app";
import { env } from "./env";

import { AppError } from "@/errors/app-error"
import { ZodError } from "zod"

app.setErrorHandler((error, request, reply) => {
  if (error instanceof AppError) {
    return reply.status(error.statusCode).send({
      message: error.message
    })
  }

  if (error instanceof ZodError) {
    return reply.status(400).send({
      message: "Validation error",
      issues: error.format()
    })
  }

  console.error(error)

  return reply.status(500).send({
    message: "Internal Server Error"
  })
})


app.listen({port: env.PORT, host: "0.0.0.0"} ).then(() => {
    console.log(`🚀 Server running on http://localhost:${env.PORT}`);
    
})