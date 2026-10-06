import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/configurations/db-config.js";
import { openAPI } from "better-auth/plugins"
import * as schema from "./db/index.js";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema
  }),
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      phoneNumber: {
        type: "string",
        required: false,
        unique: true,
        fieldName: "phone_number",
      },
      phoneNumberVerified: {
        type: "boolean",
        required: true,
        defaultValue: false,
        fieldName: "phone_number_verified",
      },
      role: {
        type: "string",
        required: true,
        defaultValue: "farmer",
        fieldName: "role",
      },
      banned: {
        type: "boolean",
        required: true,
        defaultValue: false,
        fieldName: "banned",
      },
      banReason: {
        type: "string",
        required: false,
        fieldName: "ban_reason",
      },
      banExpires: {
        type: "date",
        required: false,
        fieldName: "ban_expires",
      },
      cityOfficeId: {
        type: "string",
        required: false,
        fieldName: "city_office_id",
      },
      preferredLanguage: {
        type: "string",
        required: true,
        defaultValue: "am",
        fieldName: "preferred_language",
      },
      assignedKebeleIds: {
        type: "string",
        required: true,
        defaultValue: "{}",
        fieldName: "assigned_kebele_ids",
      },
      deletedAt: {
        type: "date",
        required: false,
        fieldName: "deleted_at",
      },
    },
  },
  plugins: [
        openAPI(), 
    ]
});