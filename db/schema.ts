import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  varchar,
  primaryKey,
} from "drizzle-orm/pg-core";
import type { AdapterAccountType } from "next-auth/adapters";
import { createId } from "@paralleldrive/cuid2";

export const role = pgEnum("role", ["ADMIN", "USER", "PRODUCER"]);

export const ticketStatus = pgEnum("ticket_status", [
  "AVAILABLE",
  "SOLD",
  "CANCELLED",
]);

export const paymentStatus = pgEnum("payment_status", [
  "PENDING",
  "PAID",
  "CANCELLED",
]);

export const eventStatus = pgEnum("event_status", [
  "ACTIVE",
  "INACTIVE",
  "ENDED",
]);

export const eventMode = pgEnum("event_mode", ["ONLINE", "IN_PERSON"]);

// TABLES

export const users = pgTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  email: text("email").unique(),
  name: text("name"),
  password: varchar("password", { length: 255 }),
  image: text("image"),
  cpf_cnpj: varchar("cpf_cnpj", { length: 255 }),
  isTwoFactorEnabled: boolean("is_two_factor_enabled").default(false),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  phone: varchar("phone", { length: 255 }),
  role: role("role"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const account = pgTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (t) => [primaryKey({ columns: [t.provider, t.providerAccountId] })]
);

export const session = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationToken = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (t) => [primaryKey({ columns: [t.identifier, t.token] })]
);

export const twoFactorToken = pgTable("two_factor_token", {
  id: varchar("id")
    .$defaultFn(() => createId())
    .primaryKey(),
  email: text("email").notNull(),
  token: text("token").notNull().unique(),
  expires: timestamp("expires").notNull(),
});

export const twoFactorConfirmation = pgTable("two_factor_confirmation", {
  id: varchar("id")
    .$defaultFn(() => createId())
    .primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
});

export const authenticator = pgTable(
  "authenticator",
  {
    credentialID: text("credentialID").notNull().unique(),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    providerAccountId: text("providerAccountId").notNull(),
    credentialPublicKey: text("credentialPublicKey").notNull(),
    counter: integer("counter").notNull(),
    credentialDeviceType: text("credentialDeviceType").notNull(),
    credentialBackedUp: boolean("credentialBackedUp").notNull(),
    transports: text("transports"),
  },
  (t) => [primaryKey({ columns: [t.userId, t.credentialID] })]
);

export const categories = pgTable("categories", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const events = pgTable("events", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  categoryId: text("category_id").references(() => categories.id, {
    onDelete: "set null",
  }),
  name: text("name").notNull(),
  description: text("description"),
  image: text("image"),
  status: eventStatus("status"),
  mode: eventMode("mode"),
  location: text("location"),
  startDate: timestamp("start_date", { withTimezone: true }).notNull(),
  endDate: timestamp("end_date", { withTimezone: true }).notNull(),
  map: text("map"),
  organizerId: text("organizer_id").references(() => users.id, {
    onDelete: "cascade",
  }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const producerEvents = pgTable("producer_events", {
  eventId: text("event_id")
    .primaryKey()
    .references(() => events.id, { onDelete: "cascade" }),
  producerName: text("producer_name").notNull(),
  showProducer: boolean("show_producer").default(false),
  producer_description: text("producer_description"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const eventDays = pgTable("event_days", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  eventId: text("event_id")
    .notNull()
    .references(() => producerEvents.eventId, { onDelete: "cascade" }),
  date: timestamp("date", { withTimezone: true }).notNull(),
  startTime: timestamp("start_time", { withTimezone: true }).notNull(),
  endTime: timestamp("end_time", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const passwordResetToken = pgTable("password_reset_token", {
  id: varchar("id")
    .$defaultFn(() => createId())
    .primaryKey(),
  email: text("email").notNull(),
  token: text("token").notNull().unique(),
  expires: timestamp("expires").notNull(),
});

// TODO: Add event days ???

export const batches = pgTable("batches", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  eventId: text("event_id")
    .notNull()
    .references(() => events.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  price: integer("price").notNull(),
  totalTickets: integer("total_tickets").notNull(),
  soldTickets: integer("sold_tickets").default(0),
  startDate: timestamp("start_date", { withTimezone: true }).notNull(),
  endDate: timestamp("end_date", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const tickets = pgTable("tickets", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  eventId: text("event_id")
    .notNull()
    .references(() => events.id, { onDelete: "cascade" }),
  batchId: text("batch_id").references(() => batches.id, {
    onDelete: "cascade",
  }),
  buyerId: text("buyer_id").references(() => users.id, {
    onDelete: "set null",
  }),
  price: integer("price").notNull(),
  isNominal: boolean("is_nominal").default(false),
  status: ticketStatus("status"), // "available", "sold", "cancelled"
  purchaseDate: timestamp("purchase_date", { withTimezone: true }),
  qrCode: text("qr_code").unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const ticketPurchases = pgTable("ticket_purchases", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  eventId: text("event_id")
    .notNull()
    .references(() => events.id, { onDelete: "cascade" }),
  ticketId: text("ticket_id")
    .notNull()
    .references(() => tickets.id, { onDelete: "cascade" }),
  purchaseDate: timestamp("purchase_date", { withTimezone: true }).defaultNow(),
  paymentStatus: paymentStatus("payment_status"),
  paymentMethod: text("payment_method"), // Example: "credit_card", "paypal"
  totalPrice: integer("total_price").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const notification = pgTable("notification", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  message: text("message").notNull(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  viewed: boolean("viewed").default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});
