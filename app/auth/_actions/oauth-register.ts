"use server";

import { z } from "zod";
import { db } from "@/db/drizzle";
import { eq } from "drizzle-orm";
import { users } from "@/db/schema";
import { oAuthRegisterSchema } from "@/db/schemas";
import { unstable_update } from "@/auth";

export const oAuthRegister = async (
  values: z.infer<typeof oAuthRegisterSchema>
) => {
  try {
    const validatedValues = oAuthRegisterSchema.safeParse(values);

    if (!validatedValues.success) {
      return { success: false, message: "Campos inválidos" };
    }

    const { id, name, role, cpf_cnpj, phone } = validatedValues.data;

    if (!id || !role || !cpf_cnpj || !phone) {
      return { success: false, message: "Campos inválidos" };
    }

    const updatedUser = await db
      .update(users)
      .set({ name, role, cpf_cnpj, phone })
      .where(eq(users.id, id));

    if (!updatedUser) {
      return { success: false, message: "Erro ao confirmar usuário" };
    }

    await unstable_update({
      user: {
        role: role,
      },
    });

    return {
      success: true,
      message: "Cadastro finalizado com sucesso!",
      url: `/dashboard/${role.toLowerCase()}`,
    };
  } catch (error) {
    console.error("Error during user sign-up:", error);
    return {
      success: false,
      message: "Erro interno no servidor. Tente novamente mais tarde.",
    };
  }
};
