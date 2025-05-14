import { sql } from "drizzle-orm"

import { ARXIV_DOMAIN_ABBREVIATIONS } from "@/constants/arxiv";

import {
  text,
  integer,
  sqliteTable,
  primaryKey
} from "drizzle-orm/sqlite-core"

export const users = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name"),
  email: text("email").notNull(),
  emailVerified: integer("emailVerified", { mode: "timestamp" }),
  image: text("image"),
});

export const accounts = sqliteTable("account", {
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  provider: text("provider").notNull(),
  providerAccountId: text("providerAccountId").notNull(),
  refresh_token: text("refresh_token"),
  access_token: text("access_token"),
  expires_at: integer("expires_at"),
  token_type: text("token_type"),
  scope: text("scope"),
  id_token: text("id_token"),
  session_state: text("session_state"),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.provider, table.providerAccountId] })
  }
});

export const sessions = sqliteTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: integer("expires", { mode: "timestamp" }).notNull(),
});

export const VALID_DOMAINS = ARXIV_DOMAIN_ABBREVIATIONS;

export const USER_TYPES = ["Researcher", "Student", "Educator"] as const;

export const userPreferences = sqliteTable("userPreference", {
  userId: text("userId")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  userType: text("userType", { enum: USER_TYPES }),
  domains: text("domains").notNull().$default(() => JSON.stringify([])),
  createdAt: integer("createdAt", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updatedAt", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export type UserType = typeof USER_TYPES[number];
export type Domain = typeof VALID_DOMAINS[number];