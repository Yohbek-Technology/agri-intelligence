ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "username" varchar(50);--> statement-breakpoint
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'users_username_key'
    ) THEN
        ALTER TABLE "users" ADD CONSTRAINT "users_username_key" UNIQUE("username");
    END IF;
END $$;