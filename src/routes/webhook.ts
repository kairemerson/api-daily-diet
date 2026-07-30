// import { FastifyInstance } from "fastify"
// import Stripe from "stripe"
// import { stripe } from "../lib/stripe"
// import { prisma } from "../lib/prisma.js"

// async function updateUserToPro(userId: string, currentPeriodEnd: number) {
//   // Transforma o timestamp Unix da Stripe em um objeto Date do JavaScript
//   const nextBillingDate = new Date(currentPeriodEnd * 1000)

//   await prisma.user.update({
//     where: { id: userId },
//     data: { 
//       isPro: true,
//       nextBillingDate
//     },
//   })
// }

// async function downgradeUser(customerId: string) {
//   const user = await prisma.user.findUnique({
//     where: { stripeCustomerId: customerId },
//   })

//   if (!user) {
//     console.error(`Webhook: usuário não encontrado para customer ${customerId}`)
//     return
//   }

//   await prisma.user.update({
//     where: { id: user.id },
//     data: { 
//       isPro: false,
//       nextBillingDate: null
//     },
//   })
// }

// export async function stripeWebhook(app: FastifyInstance) {
//   app.post(
//     "/webhook",
//     { config: { rawBody: true } }, // ativa o raw body só aqui
//     async (request, reply) => {
//       const sig = request.headers["stripe-signature"]

//       if (!sig || !request.rawBody) {
//         return reply.status(400).send({ error: "Assinatura ou corpo ausente" })
//       }

//       let event: Stripe.Event

//       try {
//         event = stripe.webhooks.constructEvent(
//           request.rawBody,
//           sig,
//           process.env.STRIPE_WEBHOOK_SECRET!
//         )
//       } catch (err) {
//         console.error("Webhook signature inválida:", err)
//         return reply.status(400).send({ error: "Assinatura inválida" })
//       }

//       console.log("Stripe event:", event.type)
//       switch (event.type) {
//         case "invoice.paid": {
//           const invoice = event.data.object as Stripe.Invoice
//           const customerId = invoice.customer as string

//           // 🔥 CORREÇÃO 1: O correto é 'subscription' no singular
//           const subscriptionId = invoice.subscription as string 
          
//           if (subscriptionId) {
//             const subscription = (await stripe.subscriptions.retrieve(subscriptionId)) as Stripe.Subscription

//             const user = await prisma.user.findUnique({
//               where: { stripeCustomerId: customerId },
//             })

//             if (user) {
//               // 🔥 CORREÇÃO 2: Acessa direto a propriedade do objeto retornado
//               await updateUserToPro(user.id, subscription.current_period_end)
//             } else {
//               console.error(`Webhook: usuário não encontrado para customer ${customerId}`)
//             }
//           }
//           break
//         }

//         case "invoice.payment_failed": {
//           const invoice = event.data.object as Stripe.Invoice
//           const customerId = invoice.customer as string
//           await downgradeUser(customerId)
//           break
//         }

//         case "customer.subscription.deleted": {
//           const subscription = event.data.object as Stripe.Subscription
//           const customerId = subscription.customer as string
//           await downgradeUser(customerId)
//           break
//         }

//         case "customer.subscription.updated": {
//           const subscription = event.data.object as Stripe.Subscription
//           const customerId = subscription.customer as string

//           // status pode ser: active, past_due, canceled, unpaid, incomplete_expired etc.
//           if (["canceled", "unpaid", "incomplete_expired"].includes(subscription.status)) {
//             await downgradeUser(customerId)
//           }
//           break
//         }

//         default:
//           // outros eventos podem ser ignorados com segurança
//           break
//       }

//       return reply.status(200).send({ received: true })
//     }
//   )
// }

import { FastifyInstance } from "fastify"
import Stripe from "stripe"
import { stripe } from "../lib/stripe"
import { prisma } from "../lib/prisma.js"

async function updateUserToPro(userId: string, currentPeriodEnd: number) {
  const nextBillingDate = new Date(currentPeriodEnd * 1000)

  await prisma.user.update({
    where: { id: userId },
    data: { 
      isPro: true,
      nextBillingDate
    },
  })
  console.log(`🚀 Usuário ${userId} atualizado para PRO com sucesso! Vencimento: ${nextBillingDate}`);
}

async function downgradeUser(userId: string) {
  await prisma.user.update({
    where: { id: userId },
    data: { 
      isPro: false,
      nextBillingDate: null
    },
  })
}

export async function stripeWebhook(app: FastifyInstance) {
  app.post(
    "/webhook",
    { config: { rawBody: true } }, 
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
      
      // 🔥 Forçamos o objeto do evento para any nesta versão antiga do SDK
      // Isso libera o acesso às chaves dynamic sem quebrar o compilador do TS
      const dataObject = event.data.object as any

      switch (event.type) {
        case "invoice.paid": {
          console.log("➡️ Processando faturamento do evento invoice.paid...");

          // 1. Captura o primeiro item do array de linhas da fatura (conforme impresso no seu log)
          const lineItem = dataObject.lines?.data?.[0];

          if (lineItem) {
            // 2. Extrai o userId diretamente dos metadados da linha da fatura
            let userId = lineItem.metadata?.userId || dataObject.metadata?.userId;

            // 3. Fallback: Se não achar na linha, busca no seu banco de dados local usando o Customer ID
            if (!userId && dataObject.customer) {
              console.log("⚠️ userId não veio na linha, buscando no banco pelo customerId...");
              const userFromDb = await prisma.user.findUnique({
                where: { stripeCustomerId: dataObject.customer }
              });
              if (userFromDb) {
                userId = userFromDb.id;
              }
            }

            // 4. Extrai o timestamp final do faturamento (period.end) impresso no seu log!
            const currentPeriodEnd = lineItem.period?.end;

            if (userId && currentPeriodEnd) {
              // Executa a atualização salvando o isPro e o nextBillingDate
              await updateUserToPro(userId, currentPeriodEnd);
            } else {
              console.error("❌ Erro ao processar dados: userId ou currentPeriodEnd ausentes.", {
                userId,
                currentPeriodEnd
              });
            }
          } else {
            console.error("❌ Erro crítico: A estrutura lines.data veio vazia na fatura.");
          }
          break;
        }



        case "invoice.payment_failed":
        case "customer.subscription.deleted": {
          let userId = dataObject.metadata?.userId

          if (!userId && dataObject.customer) {
            const customer = await stripe.customers.retrieve(dataObject.customer) as any
            userId = customer.metadata?.userId
          }

          if (userId) {
            await downgradeUser(userId)
          }
          break
        }

        case "customer.subscription.updated": {
          let userId = dataObject.metadata?.userId

          if (!userId && dataObject.customer) {
            const customer = await stripe.customers.retrieve(dataObject.customer) as any
            userId = customer.metadata?.userId
          }

          if (userId && ["canceled", "unpaid", "incomplete_expired"].includes(dataObject.status)) {
            await downgradeUser(userId)
          }
          break
        }

        default:
          break
      }

      return reply.status(200).send({ received: true })
    }
  )
}
