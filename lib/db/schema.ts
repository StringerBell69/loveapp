import { pgTable, uuid, varchar, date, timestamp, text, pgEnum, boolean, integer, decimal, jsonb } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// Enums
export const eventTypeEnum = pgEnum("event_type", ["date", "anniversary", "todo"]);
export const bucketListStatusEnum = pgEnum("bucket_list_status", ["todo", "in_progress", "done"]);
export const bucketListCategoryEnum = pgEnum("bucket_list_category", ["travel", "restaurant", "activity", "experience", "home", "other"]);
export const wishlistCategoryEnum = pgEnum("wishlist_category", ["tech", "fashion", "books", "hobbies", "home", "other"]);
export const ritualFrequencyEnum = pgEnum("ritual_frequency", ["daily", "weekly", "monthly", "yearly", "custom"]);

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

// Table: memories
export const memories = pgTable("memories", {
  id: uuid("id").primaryKey().defaultRandom(),
  coupleId: uuid("couple_id").references(() => couples.id, { onDelete: "cascade" }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  imageUrl: text("image_url").notNull(),
  memoryDate: date("memory_date").notNull(),
  category: varchar("category", { length: 50 }),
  createdBy: uuid("created_by").references(() => sql`auth.users(id)`).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// Table: love_notes (messages)
export const loveNotes = pgTable("love_notes", {
  id: uuid("id").primaryKey().defaultRandom(),
  coupleId: uuid("couple_id").references(() => couples.id, { onDelete: "cascade" }).notNull(),
  fromUserId: uuid("from_user_id").references(() => sql`auth.users(id)`).notNull(),
  toUserId: uuid("to_user_id").references(() => sql`auth.users(id)`).notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false).notNull(),
  readAt: timestamp("read_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// Table: bucket_list_items
export const bucketListItems = pgTable("bucket_list_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  coupleId: uuid("couple_id").references(() => couples.id, { onDelete: "cascade" }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  category: bucketListCategoryEnum("category").notNull(),
  status: bucketListStatusEnum("status").default("todo").notNull(),
  priority: integer("priority").default(1).notNull(), // 1-3
  progress: integer("progress").default(0).notNull(), // 0-100
  estimatedCost: varchar("estimated_cost", { length: 10 }), // '€', '€€', '€€€'
  completedDate: date("completed_date"),
  completionPhotoUrl: text("completion_photo_url"),
  completionNote: text("completion_note"),
  createdBy: uuid("created_by").references(() => sql`auth.users(id)`).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// Table: wishlist_items
export const wishlistItems = pgTable("wishlist_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  coupleId: uuid("couple_id").references(() => couples.id, { onDelete: "cascade" }).notNull(),
  userId: uuid("user_id").references(() => sql`auth.users(id)`).notNull(), // Owner
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  photoUrl: text("photo_url"),
  price: decimal("price", { precision: 10, scale: 2 }),
  priceRange: varchar("price_range", { length: 10 }), // '€', '€€', '€€€'
  productLink: text("product_link"),
  priority: integer("priority").default(1).notNull(), // 1-3
  category: wishlistCategoryEnum("category"),
  isPurchased: boolean("is_purchased").default(false).notNull(),
  purchasedBy: uuid("purchased_by").references(() => sql`auth.users(id)`), // Secret
  purchasedDate: date("purchased_date"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// Table: rituals
export const rituals = pgTable("rituals", {
  id: uuid("id").primaryKey().defaultRandom(),
  coupleId: uuid("couple_id").references(() => couples.id, { onDelete: "cascade" }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  emoji: varchar("emoji", { length: 10 }).default("✨").notNull(),
  frequencyType: ritualFrequencyEnum("frequency_type").notNull(),
  frequencyConfig: jsonb("frequency_config"), // {days: [1,2,3], time: "18:00", ...}
  reminderEnabled: boolean("reminder_enabled").default(false).notNull(),
  reminderBeforeMinutes: integer("reminder_before_minutes").default(60),
  lastDone: date("last_done"),
  streakCurrent: integer("streak_current").default(0).notNull(),
  streakLongest: integer("streak_longest").default(0).notNull(),
  createdBy: uuid("created_by").references(() => sql`auth.users(id)`).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// Table: ritual_completions
export const ritualCompletions = pgTable("ritual_completions", {
  id: uuid("id").primaryKey().defaultRandom(),
  ritualId: uuid("ritual_id").references(() => rituals.id, { onDelete: "cascade" }).notNull(),
  completedBy: uuid("completed_by").references(() => sql`auth.users(id)`).notNull(),
  completedDate: date("completed_date").notNull(),
  note: text("note"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// Types for TypeScript
export type Couple = typeof couples.$inferSelect;
export type NewCouple = typeof couples.$inferInsert;

export type UserProfile = typeof userProfiles.$inferSelect;
export type NewUserProfile = typeof userProfiles.$inferInsert;

export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;

export type Memory = typeof memories.$inferSelect;
export type NewMemory = typeof memories.$inferInsert;

export type LoveNote = typeof loveNotes.$inferSelect;
export type NewLoveNote = typeof loveNotes.$inferInsert;

export type BucketListItem = typeof bucketListItems.$inferSelect;
export type NewBucketListItem = typeof bucketListItems.$inferInsert;

export type WishlistItem = typeof wishlistItems.$inferSelect;
export type NewWishlistItem = typeof wishlistItems.$inferInsert;

export type Ritual = typeof rituals.$inferSelect;
export type NewRitual = typeof rituals.$inferInsert;

export type RitualCompletion = typeof ritualCompletions.$inferSelect;
export type NewRitualCompletion = typeof ritualCompletions.$inferInsert;
