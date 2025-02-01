ALTER TABLE "events" ALTER COLUMN "image" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "events" ALTER COLUMN "mode" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "city" text;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "neighborhood" text;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "address" text;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "uf" text;--> statement-breakpoint
ALTER TABLE "events" DROP COLUMN "location";