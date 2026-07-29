import { PLANS_LIMITS } from "../../config/plans";
import { AppError } from "../../errors/app-error";
import { prisma } from "../../lib/prisma";
import { stripe } from "../../lib/stripe";
import { UserRepository } from "../../repositories/user-repository.interface";

interface GetUserUseCaseRequest {
    userId: string
}

export class GetUserUseCase {
    constructor(private userRepository: UserRepository) {}

    async execute({userId}: GetUserUseCaseRequest) {
        const user = await this.userRepository.findById(userId)

        if(!user) {
            throw new AppError("Usuário não encontrado!")
        }

        let planName = "FREE";
        let maxPatients = 1; 

        // Se o usuário for Pro e tiver uma conta na Stripe, buscamos a assinatura ativa dele
        if (user.isPro && user.stripeCustomerId) {
            const subscriptions = await stripe.subscriptions.list({
                customer: user.stripeCustomerId,
                status: "active",
                limit: 1,
            });

            if (subscriptions.data.length > 0) {
                const activeSub = subscriptions.data[0];
                const priceId = activeSub.items.data[0].price.id;

                // Verifica se o ID do preço existe no nosso mapa de limites
                const planConfig = PLANS_LIMITS[priceId as keyof typeof PLANS_LIMITS];
                if (planConfig) {
                    planName = planConfig.name;
                    maxPatients = planConfig.maxPatients;
                }
            }
        }

        const nutritionistProfile = await prisma.nutritionistProfile.findUnique({
            where: { userId: user.id }
        });

        let currentPatientsCount = 0;


        // Conta quantos pacientes esse nutricionista específico já possui cadastrados no banco
        if (nutritionistProfile) {
            currentPatientsCount = await prisma.patientProfile.count({
                where: { nutritionistId: nutritionistProfile.id }
            });
        }


        return {
            ...user,
            plan: planName,
            maxPatients,
            currentPatientsCount,
        };
    }
}