import NextAuth from "next-auth";
import { getToken } from "next-auth/jwt";
import authConfig from "./auth.config";
import { publicRoutes, apiAuthPrefix, authRoutes } from "@/routes";

const { auth } = NextAuth(authConfig);

export default auth(async (req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const secret = process.env.AUTH_SECRET!;
  const token = await getToken({ req, secret, secureCookie: false });
  const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);

  const role = token?.role as "ADMIN" | "USER" | "PRODUCER" | undefined;

  if (isApiAuthRoute) {
    return undefined;
  }

  // Redirect to /auth/register if role is not set
  if (isLoggedIn && !role && nextUrl.pathname !== "/auth/register") {
    return Response.redirect(new URL("/auth/register", nextUrl));
  }

  if (isLoggedIn) {
    const isUserRoute = nextUrl.pathname.startsWith("/dashboard/user");
    const isProducerRoute = nextUrl.pathname.startsWith("/dashboard/producer");
    const isAdminRoute = nextUrl.pathname.startsWith("/dashboard/admin");

    if (role === "USER" && !isUserRoute) {
      return Response.redirect(new URL("/dashboard/user", nextUrl));
    }
    if (role === "PRODUCER" && !isProducerRoute) {
      return Response.redirect(new URL("/dashboard/producer", nextUrl));
    }
    if (role === "ADMIN" && !isAdminRoute) {
      return Response.redirect(new URL("/dashboard/admin", nextUrl));
    }
  }

  if (isAuthRoute) {
    if (isLoggedIn) {
      return Response.redirect(new URL(`/dasboard/${role}`, nextUrl));
    }
    return undefined;
  }

  if (!isLoggedIn && !isPublicRoute) {
    let callbackUrl = nextUrl.pathname;
    if (nextUrl.search) {
      callbackUrl += nextUrl.search;
    }

    const encodedCallbackUrl = encodeURIComponent(callbackUrl);

    return Response.redirect(
      new URL(`/auth/sign-in?callbackUrl=${encodedCallbackUrl}`, nextUrl)
    );
  }
});

// Optionally, don't invoke Middleware on some paths
export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
