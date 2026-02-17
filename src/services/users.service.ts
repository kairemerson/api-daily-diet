import { UserRepository } from "@/repositories/users.repository";
import bcrypt from "bcryptjs"


export class UserService {
    constructor(private usersRepository: UserRepository){}

    async register(data: {name: string, email: string, password: string}) {
        const userAlreadyExists = await this.usersRepository.findByEmail(data.email)

        if(userAlreadyExists) {
            throw new Error("User already exists")
        }

        const hashedPassword = await bcrypt.hash(data.password, 8)

        return this.usersRepository.create({...data, password: hashedPassword})
    }

    async login(email: string, password: string) {
        const user = await this.usersRepository.findByEmail(email)

        if(!user) {
            throw new Error("Invalid credentials")

        }

        const passwordMatch = await bcrypt.compare(password, user.password)

        if(!passwordMatch) {
            throw new Error("Invalid credentials")
        }

        return user
    }
}