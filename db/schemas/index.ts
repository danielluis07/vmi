import { z } from "zod";
import { users, events, tickets, eventDays, batches } from "@/db/schema";
import { createInsertSchema } from "drizzle-zod";
import { File } from "node-fetch";

export const baseUserSchema = createInsertSchema(users);

export const baseEventSchema = createInsertSchema(events);

const baseTicketsSchema = createInsertSchema(tickets);

const baseEventDaysSchema = createInsertSchema(eventDays);

const baseBatchesSchema = createInsertSchema(batches);

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
  date: z
    .union([z.string(), z.date()])
    .transform((val) =>
      typeof val === "string" && val !== "" ? new Date(val) : val
    ),
  ticket: baseTicketsSchema.extend({
    file: z.instanceof(File).optional(),
  }),
});

const batchesSchema = baseBatchesSchema.extend({
  startDate: z
    .union([z.string(), z.date()])
    .transform((val) =>
      typeof val === "string" && val !== "" ? new Date(val) : val
    ),
  endDate: z
    .union([z.string(), z.date()])
    .transform((val) =>
      typeof val === "string" && val !== "" ? new Date(val) : val
    ),
  tickets: z.array(
    baseTicketsSchema.extend({ file: z.instanceof(File).optional() })
  ),
});

export const createProducerEventSchema = baseEventSchema.extend({
  image: z.array(z.instanceof(File)).optional(),
  startDate: z
    .union([z.string(), z.date()])
    .transform((val) =>
      typeof val === "string" && val !== "" ? new Date(val) : val
    ),
  endDate: z
    .union([z.string(), z.date()])
    .transform((val) =>
      typeof val === "string" && val !== "" ? new Date(val) : val
    ),
  days: z.array(
    baseEventDaysSchema.extend({
      batches: z.array(batchesSchema),
      date: z
        .union([z.string(), z.date()])
        .transform((val) =>
          typeof val === "string" && val !== "" ? new Date(val) : val
        ),
      startTime: z
        .union([z.string(), z.date()])
        .transform((val) =>
          typeof val === "string" && val !== "" ? new Date(val) : val
        ),
      endTime: z
        .union([z.string(), z.date()])
        .transform((val) =>
          typeof val === "string" && val !== "" ? new Date(val) : val
        ),
    })
  ),
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
