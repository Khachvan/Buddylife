import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
export const registrations = sqliteTable("registrations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  role: text("role").notNull(),
  name: text("name"),
  businessName: text("business_name"),
  email: text("email"),
  phone: text("phone"),
  petType: text("pet_type"),
  petName: text("pet_name"),
  category: text("category"),
  city: text("city"),
  province: text("province"),
  social: text("social"),
  interests: text("interests"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});
export const contentItems = sqliteTable("content_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  contentKey: text("content_key").notNull().unique(),
  value: text("value").notNull(),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});
export const analyticsEvents = sqliteTable("analytics_events", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  eventType: text("event_type").notNull(),
  page: text("page").notNull(),
  language: text("language"),
  audience: text("audience"),
  metadata: text("metadata"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});
