import { AppError } from "../../errors/app-error";
import { UserRepository } from "../../repositories/user-repository.interface";
import bcrypt from "bcryptjs"


export interface LoginUserUseCaseRequest {
    email: string
    password: string
}

export class LoginUserUseCase {
    constructor(private userRepository: UserRepository){}

    async execute(input: LoginUserUseCaseRequest) {
        const user = await this.userRepository.findByEmail(input.email)
        
        if(!user) {
            throw new AppError("Invalid credentials")

        }

        const passwordMatch = await bcrypt.compare(input.password, user.password)

        if(!passwordMatch) {
            throw new AppError("Invalid credentials")
        }

        return user
    }
}