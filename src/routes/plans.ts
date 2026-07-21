import { FastifyInstance } from "fastify"
import Stripe from "stripe"
import { stripe } from "../lib/stripe.js"



export async function plansRoutes(app: FastifyInstance) {
  app.get("/plans", async (request, reply) => {
    // Busque os prices já expandindo o product pra pegar nome/descrição
    const result = await stripe.products.search({
      query: "active:'true' AND metadata['app']:'dietwell'",
      expand: ["data.default_price"],
    })

    const plans = result.data
      .filter((product) => product.default_price && typeof product.default_price !== "string")
      .map((product) => {
        const price = product.default_price as Stripe.Price

        return {
          id: price.id,
          title: product.name,
          description: product.description ?? "",
          price: formatPrice(price.unit_amount, price.currency),
          interval: price.recurring?.interval,
          highlight: product.metadata?.highlight === "true",
        }
      })

    return reply.send({ plans })
  })
}

function formatPrice(amount: number | null, currency: string) {
  if (!amount) return ""
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount / 100)
}