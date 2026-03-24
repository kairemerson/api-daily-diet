"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    // 🔥 Limpar banco (opcional)
    await prisma.meal.deleteMany();
    await prisma.mealPlanItem.deleteMany();
    await prisma.mealPlan.deleteMany();
    await prisma.bodyMetrics.deleteMany();
    await prisma.patientProfile.deleteMany();
    await prisma.nutritionistProfile.deleteMany();
    await prisma.user.deleteMany();
    // 🧑‍⚕️ Nutricionistas
    const nutritionists = await Promise.all(Array.from({ length: 2 }).map((_, i) => prisma.user.create({
        data: {
            name: `Nutricionista ${i + 1}`,
            email: `nutri${i + 1}@test.com`,
            password: "123456",
            role: client_1.Role.ADMIN,
            nutritionistProfile: {
                create: {
                    crn: `CRN-${i + 1}`,
                    specialty: "Emagrecimento",
                    clinic: "Clínica Saúde",
                    phone: "11999999999",
                },
            },
        },
        include: { nutritionistProfile: true },
    })));
    // 🧍 Pacientes
    const patients = [];
    for (let i = 0; i < 10; i++) {
        const nutritionist = nutritionists[i % nutritionists.length].nutritionistProfile;
        const patient = await prisma.user.create({
            data: {
                name: `Paciente ${i + 1}`,
                email: `paciente${i + 1}@test.com`,
                password: "123456",
                role: client_1.Role.PATIENT,
                patientProfile: {
                    create: {
                        nutritionistId: nutritionist.id,
                        goal: Object.values(client_1.Goal)[i % 4],
                        status: client_1.PatientStatus.ACTIVE,
                        height: 170 + i,
                        targetWeight: 70 - i,
                    },
                },
            },
            include: { patientProfile: true },
        });
        patients.push(patient);
    }
    // 🍽️ MealPlans (9 pacientes, 1 sem)
    for (let i = 0; i < patients.length; i++) {
        const patient = patients[i].patientProfile;
        // último paciente sem plano
        if (i === patients.length - 1)
            continue;
        const mealPlan = await prisma.mealPlan.create({
            data: {
                patientId: patient.id,
                title: "Plano padrão",
                description: "Plano para dieta balanceada",
                caloriesTarget: 2000,
                proteinTarget: 120,
                carbsTarget: 250,
                fatTarget: 70,
                startDate: new Date(),
            },
        });
        // 🍱 MealPlanItems
        const items = await Promise.all(["Café da manhã", "Almoço", "Jantar"].map((name, index) => prisma.mealPlanItem.create({
            data: {
                mealPlanId: mealPlan.id,
                name,
                order: index + 1,
                time: ["08:00", "12:00", "19:00"][index],
                targetCalories: 500,
            },
        })));
        // 🍴 Meals
        for (const item of items) {
            await prisma.meal.create({
                data: {
                    name: item.name,
                    date: new Date().toISOString().split("T")[0],
                    time: item.time,
                    dateTime: new Date(),
                    isOnDiet: Math.random() > 0.3,
                    patientProfileId: patient.id,
                    mealPlanItemId: item.id,
                    consumedCalories: 400 + Math.random() * 200,
                },
            });
        }
    }
    // 📊 BodyMetrics
    for (const patient of patients) {
        for (let i = 0; i < 3; i++) {
            await prisma.bodyMetrics.create({
                data: {
                    patientId: patient.patientProfile.id,
                    weight: 70 + Math.random() * 10,
                    bodyFat: 15 + Math.random() * 10,
                    muscleMass: 30 + Math.random() * 5,
                    recordedAt: new Date(Date.now() - i * 86400000),
                },
            });
        }
    }
    console.log("🌱 Seed finalizada com sucesso!");
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(() => prisma.$disconnect());
