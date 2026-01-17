import { integer, json, jsonb, pgTable, text, varchar } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  credits: integer()
});

export const sessionChatTable = pgTable("session_chat", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  sessionId:varchar().notNull(),
  notes:text(),
  selectedDoctor:json(),
  conversation:json(),
  report: jsonb('report'),
  createdBy:varchar().references(()=> usersTable.email),
  createdOn: varchar(),
});
