"use client";

import { Button } from "@/components/ui/button";
import { useTransition } from "react";
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
import { Mail } from "lucide-react";

export const SignUpForm = () => {
  const [isPending, startTransition] = useTransition();

  const handleOAuthSignIn = () => {
    startTransition(() => {
      signInWithGoogle();
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
        <CardTitle className="text-center">Cadastre sua Conta</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <Link href="/auth/register">
            <Button className="flex gap-2 w-full">
              <Mail />
              Cadastrar com Email
            </Button>
          </Link>
          <div className="w-full text-center text-muted-foreground text-xs">
            ou entre com um provedor
          </div>
          <Button
            disabled={isPending}
            className="w-full flex justify-center hover:bg-accent bg-transparent"
            onClick={handleOAuthSignIn}>
            <FcGoogle />
          </Button>
        </div>
      </CardContent>
      <CardFooter className="justify-center">
        <Link
          href="/auth/sign-in"
          className="text-muted-foreground underline-offset-4 text-sm hover:underline">
          Já possui uma conta? Entre
        </Link>
      </CardFooter>
    </Card>
  );
};
