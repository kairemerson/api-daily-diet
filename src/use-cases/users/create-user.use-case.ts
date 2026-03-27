import { AppError } from "../../errors/app-error";
import { UserRepository } from "../../repositories/user-repository.interface";
import bcrypt from "bcryptjs"

export interface CreateDataRequest {
    name: string, 
    email: string, 
    password: string, 
    role: "ADMIN" | "PATIENT"
}

export class CreateUserUseCase {
    constructor(private userRepository: UserRepository){}

    async execute(data: CreateDataRequest){
        const userAlreadyExists = await this.userRepository.findByEmail(data.email)

        if(userAlreadyExists) {
            throw new AppError("Usuário já existe")
        }

        const hashedPassword = await bcrypt.hash(data.password, 8)

        return this.userRepository.create({...data, password: hashedPassword})
    }
}