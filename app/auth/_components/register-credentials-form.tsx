"use client";

import { z } from "zod";
import { useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { FieldErrors, useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { User, Briefcase, Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { credentialsSignUpSchema } from "@/db/schemas";
import { credentialsSignUp } from "@/app/auth/_actions/credentials-sign-up";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { LoadingButton } from "@/components/ui/loading-button";

type FormData = z.infer<typeof credentialsSignUpSchema>;

export const SignUpCredentialsForm = () => {
  const [isPending, startTransition] = useTransition();
  const form = useForm<FormData>({
    resolver: zodResolver(credentialsSignUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      repeat_password: "",
      role: undefined,
      cpf_cnpj: "",
      phone: "",
    },
  });
  const router = useRouter();
  const inputValues = form.watch();
  const role = inputValues.role;

  // Check if any input is empty
  const hasEmptyInput = Object.values(inputValues).some((value) => !value);
  const onInvalid = (errors: FieldErrors) => {
    console.log(errors);
  };

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digit characters
    const digits = value.replace(/\D/g, "");

    // Initialize an empty string for the formatted number
    let formattedNumber = "";

    // Apply conditional formatting based on the number of digits
    if (digits.length > 2) {
      formattedNumber += `(${digits.slice(0, 2)}) `;
    } else {
      formattedNumber += digits;
    }

    if (digits.length > 7) {
      formattedNumber += digits.slice(2, 7) + "-" + digits.slice(7, 11);
    } else if (digits.length > 2) {
      formattedNumber += digits.slice(2, 7);
    }

    return formattedNumber;
  };

  const formatCpf = (value: string): string => {
    // Remove caracteres não numéricos
    const digits = value.replace(/\D/g, "").slice(0, 11); // Limita a 11 dígitos
    return digits
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  };

  const formatCnpj = (value: string): string => {
    // Remove caracteres não numéricos
    const digits = value.replace(/\D/g, "").slice(0, 14); // Limita a 14 dígitos
    return digits
      .replace(/(\d{2})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,4})/, "$1/$2")
      .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
  };

  const onSubmit = (values: FormData) => {
    startTransition(() => {
      credentialsSignUp(values)
        .then((res) => {
          if (!res.success) {
            toast.error(res.message);
          }

          if (res.success) {
            toast.success(res.message);
            router.push(`${res.url}`);
          }
        })
        .catch((error) => {
          console.error("Error during user sign-up:", error);
          toast.error("Um erro inesperado aconteceu. Tente novamente.");
        });
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit, onInvalid)}>
        <Card className="w-[350px]">
          <CardHeader>
            <CardTitle className="text-center text-secondary">
              {role === undefined
                ? "Escolha o tipo de conta"
                : "Termine seu cadastro"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {role === undefined && (
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value ?? undefined}
                        className="flex flex-col space-y-1">
                        <Label
                          className={cn(
                            role === "USER"
                              ? "bg-secondary text-white"
                              : "bg-white text-primary",
                            role !== "PRODUCER" &&
                              "hover:border-secondary hover:text-secondary",
                            "flex items-center justify-center cursor-pointer p-3 border rounded-md transition-colors w-full"
                          )}>
                          <FormControl>
                            <RadioGroupItem value="USER" className="hidden" />
                          </FormControl>
                          <User className="text-2xl mr-2" />
                          <span className="text-lg">Usuário</span>
                        </Label>

                        <Label
                          className={cn(
                            role === "DOCTOR"
                              ? "bg-secondary text-white"
                              : "bg-white text-primary",
                            role !== "DOCTOR" &&
                              "hover:border-secondary hover:text-secondary",
                            "flex items-center justify-center cursor-pointer p-3 border rounded-md transition-colors w-full"
                          )}>
                          <FormControl>
                            <RadioGroupItem
                              value="PRODUCER"
                              className="hidden"
                            />
                          </FormControl>
                          <Briefcase className="text-2xl mr-2" />
                          <span className="text-lg">Produtor</span>
                        </Label>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {role !== undefined && (
              <div>
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel>Nome</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value ?? ""}
                          onBlur={() => form.trigger("name")}
                          disabled={isPending}
                        />
                      </FormControl>
                      {fieldState.error && (
                        <FormMessage>{fieldState.error.message}</FormMessage>
                      )}
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value ?? ""}
                          onBlur={() => form.trigger("email")}
                          disabled={isPending}
                        />
                      </FormControl>
                      {fieldState.error && (
                        <FormMessage>{fieldState.error.message}</FormMessage>
                      )}
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="cpf_cnpj"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel>{role === "USER" ? "CPF" : "CNPJ"}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value ?? ""}
                          onChange={(event) => {
                            const value = event.target.value;

                            // Usa a variável 'role' para decidir a formatação
                            const formattedValue =
                              role === "USER"
                                ? formatCpf(value)
                                : formatCnpj(value);

                            // Atualiza o valor formatado no campo
                            field.onChange(formattedValue);
                          }}
                          onBlur={() => form.trigger("cpf_cnpj")} // Validação no blur
                          disabled={isPending}
                        />
                      </FormControl>
                      {fieldState.error && (
                        <FormMessage>{fieldState.error.message}</FormMessage>
                      )}
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel>Telefone</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value ?? ""}
                          onChange={(event) => {
                            const formattedPhoneNumber = formatPhoneNumber(
                              event.target.value
                            );
                            field.onChange(formattedPhoneNumber);
                          }}
                          onBlur={() => form.trigger("phone")}
                          disabled={isPending}
                        />
                      </FormControl>
                      {fieldState.error && (
                        <FormMessage>{fieldState.error.message}</FormMessage>
                      )}
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel>Senha</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="password"
                          value={field.value ?? ""}
                          onBlur={() => form.trigger("password")}
                          disabled={isPending}
                        />
                      </FormControl>
                      {fieldState.error && (
                        <FormMessage>{fieldState.error.message}</FormMessage>
                      )}
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="repeat_password"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel>Repita a senha</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="password"
                          value={field.value ?? ""}
                          onBlur={() => form.trigger("repeat_password")}
                          disabled={isPending}
                        />
                      </FormControl>
                      {fieldState.error && (
                        <FormMessage>{fieldState.error.message}</FormMessage>
                      )}
                    </FormItem>
                  )}
                />
              </div>
            )}
          </CardContent>
          <CardFooter>
            {role !== undefined && (
              <div className="flex gap-2 w-full">
                <Button
                  type="button"
                  className="w-full"
                  onClick={() => {
                    form.setValue("role", undefined);
                    form.clearErrors();
                  }}>
                  Voltar
                </Button>
                <LoadingButton
                  type="submit"
                  className="w-full"
                  isPending={isPending}
                  disabled={hasEmptyInput || isPending}
                  label="Finalizar Cadastro"
                  loadingLabel="Finalizando"
                />
              </div>
            )}
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
};
