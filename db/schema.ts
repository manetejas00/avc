import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';
export const submissions = pgTable('form_submissions', {
  id: serial().primaryKey(), name: text().notNull(), email: text().notNull(), phone: text().notNull(),
  interest: text().notNull().default(''), message: text().notNull().default(''), status: text().notNull().default('pending'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
export const syncLogs = pgTable('api_sync_logs', {
  id: serial().primaryKey(), provider: text().notNull(), status: text().notNull(), message: text().notNull().default(''),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
