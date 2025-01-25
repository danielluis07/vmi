import { auth } from "@/auth";
import { SignUpCredentialsForm } from "@/app/auth/_components/register-credentials-form";
import { RegisterOAuthForm } from "@/app/auth/_components/register-oauth-form";

const RegisterPage = async () => {
  const session = await auth();
  const isOAuth = session?.user.isOAuth;

  if (!session) {
    return (
      <div className="flex items-center justify-center h-full bg-primary">
        <SignUpCredentialsForm />
      </div>
    );
  }

  if (session && isOAuth) {
    return (
      <div className="flex items-center justify-center h-full bg-primary">
        <RegisterOAuthForm user={session.user} />
      </div>
    );
  }
};

export default RegisterPage;
