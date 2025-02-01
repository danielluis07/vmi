import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { db } from "@/db/drizzle";
import { ticketSector } from "@/db/schema";
import { eq } from "drizzle-orm";

const app = new Hono().get("/", async (c) => {
  const data = await db.select().from(ticketSector);

  if (!data || data.length === 0) {
    return c.json({ error: "No ticket sectors found" }, 404);
  }

  return c.json({ data });
});

export default app;
