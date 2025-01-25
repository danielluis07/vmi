CREATE TYPE "public"."event_mode" AS ENUM('ONLINE', 'IN_PERSON');--> statement-breakpoint
CREATE TYPE "public"."event_status" AS ENUM('ACTIVE', 'INACTIVE', 'ENDED');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('PENDING', 'PAID', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."ticket_status" AS ENUM('AVAILABLE', 'SOLD', 'CANCELLED');--> statement-breakpoint
CREATE TABLE "batches" (
	"id" text PRIMARY KEY NOT NULL,
	"event_id" text NOT NULL,
	"name" text NOT NULL,
	"price" integer NOT NULL,
	"total_tickets" integer NOT NULL,
	"sold_tickets" integer DEFAULT 0,
	"start_date" timestamp with time zone NOT NULL,
	"end_date" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "event_days" (
	"id" text PRIMARY KEY NOT NULL,
	"event_id" text NOT NULL,
	"date" timestamp with time zone NOT NULL,
	"start_time" timestamp with time zone NOT NULL,
	"end_time" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" text PRIMARY KEY NOT NULL,
	"category_id" text,
	"name" text NOT NULL,
	"description" text,
	"image" text,
	"status" "event_status",
	"mode" "event_mode",
	"location" text,
	"start_date" timestamp with time zone NOT NULL,
	"end_date" timestamp with time zone NOT NULL,
	"map" text,
	"organizer_id" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "producer_events" (
	"event_id" text PRIMARY KEY NOT NULL,
	"producer_name" text NOT NULL,
	"show_producer" boolean DEFAULT false,
	"producer_description" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ticket_purchases" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"event_id" text NOT NULL,
	"ticket_id" text NOT NULL,
	"purchase_date" timestamp with time zone DEFAULT now(),
	"payment_status" "payment_status",
	"payment_method" text,
	"total_price" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "tickets" (
	"id" text PRIMARY KEY NOT NULL,
	"event_id" text NOT NULL,
	"batch_id" text,
	"buyer_id" text,
	"price" integer NOT NULL,
	"is_nominal" boolean DEFAULT false,
	"status" "ticket_status",
	"purchase_date" timestamp with time zone,
	"qr_code" text,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "tickets_qr_code_unique" UNIQUE("qr_code")
);
--> statement-breakpoint
ALTER TABLE "batches" ADD CONSTRAINT "batches_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_days" ADD CONSTRAINT "event_days_event_id_producer_events_event_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."producer_events"("event_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_organizer_id_user_id_fk" FOREIGN KEY ("organizer_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "producer_events" ADD CONSTRAINT "producer_events_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ticket_purchases" ADD CONSTRAINT "ticket_purchases_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ticket_purchases" ADD CONSTRAINT "ticket_purchases_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ticket_purchases" ADD CONSTRAINT "ticket_purchases_ticket_id_tickets_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "public"."tickets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_batch_id_batches_id_fk" FOREIGN KEY ("batch_id") REFERENCES "public"."batches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_buyer_id_user_id_fk" FOREIGN KEY ("buyer_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;