import z from "zod"
import { UserSchema } from "./user.schema"

export const RegisterSchema = z.object({
    name: z.string().min(1, 'Name is required').max(255),
    email: z.string().email('Invalid email'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
})

export const LoginSchema = z.object({
    email: z.string().email('Invalid email'),
    password: z.string().min(1, 'Password is required'),
})

export const AuthResponseSchema = z.object({
    token: z.string(),
    user: UserSchema,
})