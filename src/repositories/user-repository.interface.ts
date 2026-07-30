
export interface UserRepository {
    findByEmail(email: string): Promise<User | null>
    create(data: CreateUserDTO): Promise<User>
    findById(id: string): Promise<User | null>
}

export type User = {
    id: string
    name: string
    email: string
    password: string
    role: "ADMIN" | "PATIENT"
    isPro: boolean
    stripeCustomerId: string | null
    nextBillingDate: Date | null
}

export type CreateUserDTO = {
  name: string;
  email: string;
  password: string;
  role: "ADMIN" | "PATIENT";
};