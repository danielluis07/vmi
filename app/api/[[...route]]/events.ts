import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { db } from "@/db/drizzle";
import { events, tickets } from "@/db/schema";
import { eq } from "drizzle-orm";

const app = new Hono()
  .get("/", async (c) => {
    const data = await db.select().from(events);

    return c.json({ data });
  })
  .get(
    "/:id",
    zValidator("param", z.object({ id: z.string().optional() })),
    async (c) => {
      const { id } = c.req.valid("param");

      if (!id) {
        return c.json({ error: "Missing id" }, 400);
      }

      const [data] = await db.select().from(events).where(eq(events.id, id));

      if (!data) {
        return c.json({ error: "Event not found" }, 404);
      }

      return c.json({ data }, 200);
    }
  )
  .get(
    "/user/:id",
    zValidator("param", z.object({ id: z.string().optional() })),
    async (c) => {
      const { id } = c.req.valid("param");

      if (!id) {
        return c.json({ error: "Missing id" }, 400);
      }

      const data = await db
        .select()
        .from(events)
        .where(eq(events.organizerId, id))
        .leftJoin(tickets, eq(events.id, tickets.eventId));

      if (!data) {
        return c.json({ error: "Event not found" }, 404);
      }

      return c.json({ data }, 200);
    }
  );

export default app;
