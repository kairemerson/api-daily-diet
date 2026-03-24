
export interface UserRepository {
    findByEmail(email: string): Promise<User | null>
    create(data: CreateUserDTO): Promise<User>
}

export type User = {
    id: string
    name: string
    email: string
    password: string
    role: "ADMIN" | "PATIENT"
}

export type CreateUserDTO = {
  name: string;
  email: string;
  password: string;
  role: "ADMIN" | "PATIENT";
};