import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const moodEntries = pgTable("mood_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id"),
  happiness: integer("happiness").notNull(), // 0-100
  calmness: integer("calmness").notNull(),   // 0-100
  quickMood: text("quick_mood"), // optional: 'happy', 'sad', etc.
  colorHex: text("color_hex").notNull(),
  colorHsl: text("color_hsl").notNull(),
  hue: real("hue").notNull(),
  saturation: real("saturation").notNull(),
  lightness: real("lightness").notNull(),
  notes: text("notes"),
  isAnonymous: integer("is_anonymous").default(0).notNull(), // 0 or 1
  country: text("country"),
  city: text("city"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const emotionMessages = pgTable("emotion_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  moodEntryId: varchar("mood_entry_id").references(() => moodEntries.id),
  message: text("message").notNull(),
  isAnonymous: integer("is_anonymous").default(1).notNull(),
  supportCount: integer("support_count").default(0).notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const musicRecommendations = pgTable("music_recommendations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  artist: text("artist").notNull(),
  genre: text("genre"),
  moodType: text("mood_type").notNull(), // happy, sad, calm, etc.
  spotifyUrl: text("spotify_url"),
  youtubeUrl: text("youtube_url"),
  isActive: integer("is_active").default(1).notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertMoodEntrySchema = createInsertSchema(moodEntries).omit({
  id: true,
  createdAt: true,
  timestamp: true,
}).extend({
  happiness: z.number().min(0).max(100),
  calmness: z.number().min(0).max(100),
});

export const insertEmotionMessageSchema = createInsertSchema(emotionMessages).omit({
  id: true,
  timestamp: true,
  supportCount: true,
});

export const insertMusicRecommendationSchema = createInsertSchema(musicRecommendations).omit({
  id: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type MoodEntry = typeof moodEntries.$inferSelect;
export type InsertMoodEntry = z.infer<typeof insertMoodEntrySchema>;
export type EmotionMessage = typeof emotionMessages.$inferSelect;
export type InsertEmotionMessage = z.infer<typeof insertEmotionMessageSchema>;
export type MusicRecommendation = typeof musicRecommendations.$inferSelect;
export type InsertMusicRecommendation = z.infer<typeof insertMusicRecommendationSchema>;
