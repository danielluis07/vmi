CREATE TYPE "public"."ticket_gender" AS ENUM('MALE', 'FEMALE');--> statement-breakpoint
ALTER TABLE "tickets" ADD COLUMN "gender" "ticket_gender";