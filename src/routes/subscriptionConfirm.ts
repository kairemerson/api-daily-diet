import { FastifyInstance } from "fastify"
import { stripe } from "../lib/stripe"
import { prisma } from "../lib/prisma.js"

export async function subscriptionsConfirmRoutes(app: FastifyInstance) {

    app.post("/subscriptions/:id/confirm", async (request, reply) => {
        const { id } = request.params as { id: string }

        const subscription = await stripe.subscriptions.retrieve(id)
        const customerId = subscription.customer as string

        const user = await prisma.user.findUnique({
            where: { stripeCustomerId: customerId },
        })

        if (!user) {
            return reply.status(404).send({ error: "Usuário não encontrado" })
        }

        // Confirma o status real na Stripe antes de liberar
        if (subscription.status === "active" || subscription.status === "trialing") {
            await prisma.user.update({
                where: { id: user.id },
                data: { isPro: true },
            })
        }

        return reply.send({ status: subscription.status })
    })
}
