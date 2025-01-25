import { z } from "zod";
import { users } from "@/db/schema";
import { createInsertSchema } from "drizzle-zod";

export const baseUserSchema = createInsertSchema(users);

export const credentialsSignUpSchema = baseUserSchema
  .extend({
    name: z.string().min(1, "É necessário informar um nome"),
    email: z
      .string()
      .email("Email inválido")
      .min(1, "É necessário informar um email"),
    password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
    repeat_password: z
      .string()
      .min(6, "A senha deve ter pelo menos 6 caracteres"),
    cpf_cnpj: z.string().min(1, "É necessário informar um CPF"),
    phone: z.string().min(1, "É necessário informar um telefone"),
  })
  .refine((data) => data.password === data.repeat_password, {
    message: "As senhas não coincidem",
    path: ["repeat_password"], // Assign error to repeat_password field
  });

export const oAuthRegisterSchema = baseUserSchema.pick({
  id: true,
  name: true,
  role: true,
  cpf_cnpj: true,
  phone: true,
});

export const credentialsSignInSchema = baseUserSchema.extend({
  email: z
    .string()
    .email("Email inválido")
    .min(1, "É necessário informar um email"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
});
