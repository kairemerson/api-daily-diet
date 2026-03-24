import { AppError } from "../errors/app-error"
import { UserRepository } from "../repositories/user-repository.interface"
import bcrypt from "bcryptjs"


export class UserService {
    constructor(private usersRepository: UserRepository){}

    async register(data: {name: string, email: string, password: string, role: "ADMIN" | "PATIENT"}) {
        const userAlreadyExists = await this.usersRepository.findByEmail(data.email)

        if(userAlreadyExists) {
            throw new AppError("Usuário já existe")
        }

        const hashedPassword = await bcrypt.hash(data.password, 8)

        return this.usersRepository.create({...data, password: hashedPassword})
    }

    async login(email: string, password: string) {
        const user = await this.usersRepository.findByEmail(email)

        if(!user) {
            throw new AppError("Invalid credentials")

        }

        const passwordMatch = await bcrypt.compare(password, user.password)

        if(!passwordMatch) {
            throw new AppError("Invalid credentials")
        }

        return user
    }
}