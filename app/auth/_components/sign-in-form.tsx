"use client";

import { z } from "zod";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { signInWithGoogle } from "@/app/auth/_actions/oauth-sign-in";
import Image from "next/image";
import { FcGoogle } from "react-icons/fc";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
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
import { credentialsSignInSchema } from "@/db/schemas";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { credentialsSignIn } from "../_actions/credentials-sign-in";

type FormData = z.infer<typeof credentialsSignInSchema>;

export const SignInForm = () => {
  const [isPending, startTransition] = useTransition();
  const form = useForm<FormData>({
    resolver: zodResolver(credentialsSignInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");
  const urlError =
    searchParams.get("error") === "OAuthAccountNotLinked"
      ? "Esse email já está em uso com outro provedor!"
      : "";
  const router = useRouter();

  const handleOAuthSignIn = () => {
    startTransition(() => {
      signInWithGoogle();
    });
  };

  const onInvalid = (errors: FieldErrors) => {
    console.log(errors);
  };

  const onSubmit = (values: FormData) => {
    startTransition(() => {
      credentialsSignIn(values, callbackUrl)
        .then((res) => {
          if (!res.success) {
            toast.error(res.message);
          }

          if (res.success) {
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
    <Card className="w-[350px]">
      <CardHeader>
        <Image
          src="/logo.png"
          width={80}
          height={80}
          alt="logo"
          className="mx-auto"
          priority
        />
        <CardTitle className="text-center">Entre sua Conta</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit, onInvalid)}>
            <div>
              <FormField
                control={form.control}
                name="email"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        disabled={isPending}
                        type="email"
                        {...field}
                        value={field.value ?? ""}
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
                        disabled={isPending}
                        type="password"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    {fieldState.error && (
                      <FormMessage>{fieldState.error.message}</FormMessage>
                    )}
                  </FormItem>
                )}
              />
              <Button disabled={isPending} className="w-full mt-5">
                Entrar
              </Button>
            </div>
            <div className="w-full text-center text-muted-foreground text-xs my-2">
              ou entre com um provedor
            </div>
            <Button
              type="button"
              disabled={isPending}
              className="w-full flex justify-center hover:bg-accent bg-transparent"
              onClick={handleOAuthSignIn}>
              <FcGoogle />
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="justify-center">
        <Link
          href="/auth/sign-up"
          className="text-muted-foreground underline-offset-4 text-sm hover:underline">
          Não possui uma conta? Cadastre-se
        </Link>
      </CardFooter>
    </Card>
  );
};
