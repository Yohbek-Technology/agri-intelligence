ALTER TABLE "users" ALTER COLUMN "status" SET DEFAULT 'APPROVED'::"approval_status";--> statement-breakpoint
ALTER TABLE "farmers" ALTER COLUMN "status" SET DEFAULT 'APPROVED'::"approval_status";--> statement-breakpoint
UPDATE "users" SET "status" = 'APPROVED' WHERE "status" = 'PENDING';--> statement-breakpoint
UPDATE "farmers" SET "status" = 'APPROVED' WHERE "status" = 'PENDING';