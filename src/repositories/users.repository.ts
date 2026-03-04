import { prisma } from "@/lib/prisma";

export class UserRepository {
    async findByEmail(email: string) {
        return prisma.user.findUnique({
            where: {email}
        })
    }

    async create(data: {name: string, email: string, password: string, role: "ADMIN" | "PATIENT"}) {
        
        return prisma.user.create({data})
    }
}