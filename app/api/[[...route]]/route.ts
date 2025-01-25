import { Hono } from "hono";
import { handle } from "hono/vercel";
import users from "@/app/api/[[...route]]/users";
import events from "@/app/api/[[...route]]/events";
import producers from "@/app/api/[[...route]]/producers";
import categories from "@/app/api/[[...route]]/categories";

export const runtime = "nodejs";

const app = new Hono().basePath("/api");

// const AUTH_SECRET = process.env.AUTH_SECRET;

const routes = app
  .route("/users", users)
  .route("/producers", producers)
  .route("/events", events)
  .route("/categories", categories);

export const GET = handle(app);
export const POST = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);

export type AppType = typeof routes;
