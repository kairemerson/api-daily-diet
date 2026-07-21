import { FastifyInstance } from "fastify"
import Stripe from "stripe"
import { stripe } from "../lib/stripe";
import { prisma } from "../lib/prisma.js";


export async function subscriptionsRoutes(app: FastifyInstance) {
  app.post("/subscriptions", async (request, reply) => {
    const { priceId, userId } = request.body as { priceId: string; userId: string }

    // Busque o customer já salvo no seu banco, ou crie um novo na Stripe
    const user = await prisma.user.findUnique({ where: { id: userId } })

    let customerId = user?.stripeCustomerId

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user?.email,
        metadata: { userId },
      })
      customerId = customer.id
      await prisma.user.update({
        where: { id: userId },
        data: { stripeCustomerId: customerId },
      })
    }

    const ephemeralKey = await stripe.ephemeralKeys.create(
      { customer: customerId },
      { apiVersion: "2024-06-20"  }
    )

    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: "default_incomplete",
      payment_settings: { save_default_payment_method: "on_subscription" },
      expand: ["latest_invoice.confirmation_secret"],
    })

    const invoice = subscription.latest_invoice as Stripe.Invoice
    const clientSecret = invoice.confirmation_secret?.client_secret

    if (!clientSecret) {
      return reply.status(500).send({ error: "Não foi possível obter o client secret" })
    }

    return reply.send({
      subscriptionId: subscription.id,
      clientSecret,
      ephemeralKey: ephemeralKey.secret,
      customerId,
    })
  })
}