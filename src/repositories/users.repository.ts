import { prisma } from "../lib/prisma";
import { CreateUserDTO, UserRepository } from "./user-repository.interface";

export class PrismaUserRepository implements UserRepository {
    async findByEmail(email: string) {
        return prisma.user.findUnique({
            where: {email}
        })
    }

    async create(data: CreateUserDTO) {
        
        return prisma.user.create({data})
    }

    async findById(id: string) {
        const user = await prisma.user.findUnique({
            where: {id}
        })

        return user
    }
}