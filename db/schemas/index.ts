import { z } from "zod";
import { users, events, tickets } from "@/db/schema";
import { createInsertSchema } from "drizzle-zod";
import { File } from "node-fetch";

export const baseUserSchema = createInsertSchema(users);

export const baseEventSchema = createInsertSchema(events);

const baseTicketsSchema = createInsertSchema(tickets);

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

export const createEventSchema = baseEventSchema.extend({
  image: z.array(z.instanceof(File)).optional(), // Enforce File[] type
  ticket: baseTicketsSchema.extend({
    file: z.instanceof(File).optional(),
  }),
});

export const modes: Array<"IN_PERSON" | "ONLINE"> = ["IN_PERSON", "ONLINE"];

export const uf: Array<
  | "AC"
  | "AL"
  | "AP"
  | "AM"
  | "BA"
  | "CE"
  | "DF"
  | "ES"
  | "GO"
  | "MA"
  | "MT"
  | "MS"
  | "MG"
  | "PA"
  | "PB"
  | "PR"
  | "PE"
  | "PI"
  | "RJ"
  | "RN"
  | "RS"
  | "RO"
  | "RR"
  | "SC"
  | "SP"
  | "SE"
  | "TO"
> = [
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
];
