"use server";

import { z } from "zod";
import { db } from "@/db/drizzle";
import { eq, or } from "drizzle-orm";
import { users } from "@/db/schema";
import { credentialsSignUpSchema } from "@/db/schemas";
import bcrypt from "bcryptjs";
import { signIn } from "@/auth";

export const credentialsSignUp = async (
  values: z.infer<typeof credentialsSignUpSchema>
) => {
  try {
    const validatedValues = credentialsSignUpSchema.safeParse(values);

    if (!validatedValues.success) {
      return { success: false, message: "Campos inválidos" };
    }

    const { name, email, role, cpf_cnpj, phone, password } =
      validatedValues.data;

    if (!role || !name || !email || !cpf_cnpj || !phone || !password) {
      return { success: false, message: "Estão faltando campos" };
    }

    const [existingUser] = await db
      .select({ email: users.email, cpf_cnpj: users.cpf_cnpj })
      .from(users)
      .where(or(eq(users.email, email), eq(users.cpf_cnpj, cpf_cnpj)));

    if (existingUser) {
      return {
        success: false,
        message: "Email ou CPF/CNPJ informado já está cadastrado",
      };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [newUser] = await db
      .insert(users)
      .values({
        name,
        role,
        cpf_cnpj,
        phone,
        email,
        password: hashedPassword,
      })
      .returning({ id: users.id, role: users.role });

    if (!newUser) {
      return { success: false, message: "Erro ao criar usuário" };
    }

    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    return {
      success: true,
      message: "Usuário criado com sucesso",
      url: `/dashboard/${newUser.role}`,
    };
  } catch (error) {
    console.error("Error during user sign-up:", error);
    return {
      success: false,
      message: "Erro interno no servidor. Tente novamente mais tarde.",
    };
  }
};
