ALTER TABLE "tickets" ALTER COLUMN "is_nominal" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "tickets" ADD COLUMN "obs" text;