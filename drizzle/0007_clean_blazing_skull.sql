ALTER TABLE "tickets" RENAME COLUMN "sector" TO "sector_id";--> statement-breakpoint
ALTER TABLE "tickets" RENAME COLUMN "ticket_file_url" TO "file";--> statement-breakpoint
ALTER TABLE "tickets" DROP CONSTRAINT "tickets_sector_ticket_sectors_id_fk";
--> statement-breakpoint
ALTER TABLE "tickets" ALTER COLUMN "event_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_sector_id_ticket_sectors_id_fk" FOREIGN KEY ("sector_id") REFERENCES "public"."ticket_sectors"("id") ON DELETE set null ON UPDATE no action;