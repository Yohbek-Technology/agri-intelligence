CREATE TYPE "device_platform" AS ENUM('pwa', 'android');--> statement-breakpoint
ALTER TABLE "devices" ADD COLUMN "platform" "device_platform" DEFAULT 'pwa'::"device_platform" NOT NULL;--> statement-breakpoint
ALTER TABLE "devices" ADD COLUMN "fcm_token" text;--> statement-breakpoint
ALTER TABLE "devices" ADD CONSTRAINT "devices_android_no_web_push" CHECK (platform <> 'android' or web_push_subscription is null);--> statement-breakpoint
ALTER TABLE "devices" ADD CONSTRAINT "devices_pwa_no_fcm" CHECK (platform <> 'pwa' or fcm_token is null);