import { pgTable, uuid, varchar, date, timestamp, text, pgEnum } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// Enum for event types
export const eventTypeEnum = pgEnum("event_type", ["date", "anniversary", "todo"]);

// Table: couples
export const couples = pgTable("couples", {
  id: uuid("id").primaryKey().defaultRandom(),
  coupleCode: varchar("couple_code", { length: 6 }).notNull().unique(),
  anniversaryDate: date("anniversary_date"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// Table: user_profiles
export const userProfiles = pgTable("user_profiles", {
  id: uuid("id").primaryKey().references(() => sql`auth.users(id)`, { onDelete: "cascade" }),
  name: varchar("name", { length: 100 }).notNull(),
  coupleId: uuid("couple_id").references(() => couples.id, { onDelete: "set null" }),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// Table: events
export const events = pgTable("events", {
  id: uuid("id").primaryKey().defaultRandom(),
  coupleId: uuid("couple_id").references(() => couples.id, { onDelete: "cascade" }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  eventDate: date("event_date").notNull(),
  eventTime: text("event_time"), // Storing as text since Drizzle doesn't have native time type
  eventType: eventTypeEnum("event_type").default("date").notNull(),
  color: varchar("color", { length: 7 }).default("#FF6B9D").notNull(),
  createdBy: uuid("created_by").references(() => sql`auth.users(id)`).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// Types for TypeScript
export type Couple = typeof couples.$inferSelect;
export type NewCouple = typeof couples.$inferInsert;

export type UserProfile = typeof userProfiles.$inferSelect;
export type NewUserProfile = typeof userProfiles.$inferInsert;

export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;
