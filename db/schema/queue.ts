import { pgTable, text, timestamp, boolean, integer, uuid, varchar } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const service = pgTable("service", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  duration: integer("duration").notNull(), // duration in minutes
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const timeSlot = pgTable("time_slot", {
  id: uuid("id").primaryKey().defaultRandom(),
  serviceId: uuid("service_id").notNull().references(() => service.id, { onDelete: "cascade" }),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  capacity: integer("capacity").notNull().default(1), // max number of reservations for this slot
  isAvailable: boolean("is_available").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const reservation = pgTable("reservation", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  serviceId: uuid("service_id").notNull().references(() => service.id, { onDelete: "cascade" }),
  timeSlotId: uuid("time_slot_id").notNull().references(() => timeSlot.id, { onDelete: "cascade" }),
  status: varchar("status", { length: 50 }).notNull().default("confirmed"), // confirmed, cancelled, completed, no_show
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const queueEntry = pgTable("queue_entry", {
  id: uuid("id").primaryKey().defaultRandom(),
  reservationId: uuid("reservation_id").notNull().references(() => reservation.id, { onDelete: "cascade" }),
  position: integer("position").notNull(),
  status: varchar("status", { length: 50 }).notNull().default("waiting"), // waiting, in_progress, completed, cancelled
  checkInTime: timestamp("check_in_time"),
  estimatedStartTime: timestamp("estimated_start_time"),
  actualStartTime: timestamp("actual_start_time"),
  completedTime: timestamp("completed_time"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Types for TypeScript
export type Service = typeof service.$inferSelect;
export type NewService = typeof service.$inferInsert;

export type TimeSlot = typeof timeSlot.$inferSelect;
export type NewTimeSlot = typeof timeSlot.$inferInsert;

export type Reservation = typeof reservation.$inferSelect;
export type NewReservation = typeof reservation.$inferInsert;

export type QueueEntry = typeof queueEntry.$inferSelect;
export type NewQueueEntry = typeof queueEntry.$inferInsert;