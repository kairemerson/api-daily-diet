import { FastifyInstance } from "fastify"
import Stripe from "stripe"
import { stripe } from "../lib/stripe"
import { prisma } from "../lib/prisma.js"

async function updateUserToPro(userId: string) {
  await prisma.user.update({
    where: { id: userId },
    data: { isPro: true },
  })
}

async function downgradeUser(customerId: string) {
  const user = await prisma.user.findUnique({
    where: { stripeCustomerId: customerId },
  })

  if (!user) {
    console.error(`Webhook: usuário não encontrado para customer ${customerId}`)
    return
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { isPro: false },
  })
}

export async function stripeWebhook(app: FastifyInstance) {
  app.post(
    "/webhook",
    { config: { rawBody: true } }, // ativa o raw body só aqui
    async (request, reply) => {
      const sig = request.headers["stripe-signature"]

      if (!sig || !request.rawBody) {
        return reply.status(400).send({ error: "Assinatura ou corpo ausente" })
      }

      let event: Stripe.Event

      try {
        event = stripe.webhooks.constructEvent(
          request.rawBody,
          sig,
          process.env.STRIPE_WEBHOOK_SECRET!
        )
      } catch (err) {
        console.error("Webhook signature inválida:", err)
        return reply.status(400).send({ error: "Assinatura inválida" })
      }

      console.log("Stripe event:", event.type)
      switch (event.type) {
        case "invoice.paid": {
          const invoice = event.data.object as Stripe.Invoice
          const customerId = invoice.customer as string

          const user = await prisma.user.findUnique({
            where: { stripeCustomerId: customerId },
          })

          if (user) {
            await updateUserToPro(user.id)
          } else {
            console.error(`Webhook: usuário não encontrado para customer ${customerId}`)
          }
          break
        }

        case "invoice.payment_failed": {
          const invoice = event.data.object as Stripe.Invoice
          const customerId = invoice.customer as string
          await downgradeUser(customerId)
          break
        }

        case "customer.subscription.deleted": {
          const subscription = event.data.object as Stripe.Subscription
          const customerId = subscription.customer as string
          await downgradeUser(customerId)
          break
        }

        case "customer.subscription.updated": {
          const subscription = event.data.object as Stripe.Subscription
          const customerId = subscription.customer as string

          // status pode ser: active, past_due, canceled, unpaid, incomplete_expired etc.
          if (["canceled", "unpaid", "incomplete_expired"].includes(subscription.status)) {
            await downgradeUser(customerId)
          }
          break
        }

        default:
          // outros eventos podem ser ignorados com segurança
          break
      }

      return reply.status(200).send({ received: true })
    }
  )
}