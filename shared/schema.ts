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
  city: text("city"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const moodTwins = pgTable("mood_twins", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  moodEntryId: varchar("mood_entry_id").references(() => moodEntries.id),
  musicType: text("music_type").notNull(), // "lo-fi 雨聲", "古典音樂", etc.
  twinCount: integer("twin_count").default(0).notNull(),
  city: text("city"),
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
  appleMusicUrl: text("apple_music_url"),
  youtubeMusicUrl: text("youtube_music_url"),
  isActive: integer("is_active").default(1).notNull(),
});

// 用戶音樂平台連接
export const userMusicPlatforms = pgTable("user_music_platforms", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  platform: text("platform").notNull(), // spotify, apple_music, youtube_music
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  expiresAt: timestamp("expires_at"),
  isConnected: integer("is_connected").default(1).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 用戶音樂偏好分析
export const userMusicPreferences = pgTable("user_music_preferences", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  topGenres: text("top_genres").array().notNull(), // ["pop", "rock", "jazz"]
  topArtists: text("top_artists").array().notNull(), // ["Taylor Swift", "Ed Sheeran"]
  preferredMoodTypes: text("preferred_mood_types").array().notNull(), // ["happy", "calm"]
  energyLevel: real("energy_level"), // 0-1 based on listening history
  valence: real("valence"), // 0-1 positivity based on listening history
  lastAnalyzed: timestamp("last_analyzed").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 個人化音樂推薦記錄
export const personalizedRecommendations = pgTable("personalized_recommendations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  musicRecommendationId: varchar("music_recommendation_id").references(() => musicRecommendations.id),
  moodEntryId: varchar("mood_entry_id").references(() => moodEntries.id),
  confidence: real("confidence").notNull(), // 0-1 推薦信心度
  reason: text("reason"), // 推薦原因說明
  wasPlayed: integer("was_played").default(0).notNull(),
  wasLiked: integer("was_liked").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 用戶聽歌記錄
export const userListeningHistory = pgTable("user_listening_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  musicRecommendationId: varchar("music_recommendation_id").references(() => musicRecommendations.id),
  moodEntryId: varchar("mood_entry_id").references(() => moodEntries.id),
  platform: text("platform").notNull(), // spotify, apple_music, youtube_music
  playedAt: timestamp("played_at").defaultNow().notNull(),
  duration: integer("duration"), // 播放秒數
  completed: integer("completed").default(0).notNull(), // 是否完整播放
  liked: integer("liked").default(0).notNull(),
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

export const insertMoodTwinSchema = createInsertSchema(moodTwins).omit({
  id: true,
  timestamp: true,
});

export const insertMusicRecommendationSchema = createInsertSchema(musicRecommendations).omit({
  id: true,
});

export const insertUserMusicPlatformSchema = createInsertSchema(userMusicPlatforms).omit({
  id: true,
  createdAt: true,
});

export const insertUserMusicPreferenceSchema = createInsertSchema(userMusicPreferences).omit({
  id: true,
  lastAnalyzed: true,
  updatedAt: true,
});

export const insertPersonalizedRecommendationSchema = createInsertSchema(personalizedRecommendations).omit({
  id: true,
  createdAt: true,
});

export const insertUserListeningHistorySchema = createInsertSchema(userListeningHistory).omit({
  id: true,
  playedAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type MoodEntry = typeof moodEntries.$inferSelect;
export type InsertMoodEntry = z.infer<typeof insertMoodEntrySchema>;
export type EmotionMessage = typeof emotionMessages.$inferSelect;
export type InsertEmotionMessage = z.infer<typeof insertEmotionMessageSchema>;
export type MusicRecommendation = typeof musicRecommendations.$inferSelect;
export type InsertMusicRecommendation = z.infer<typeof insertMusicRecommendationSchema>;
export type MoodTwin = typeof moodTwins.$inferSelect;
export type InsertMoodTwin = z.infer<typeof insertMoodTwinSchema>;
export type UserMusicPlatform = typeof userMusicPlatforms.$inferSelect;
export type InsertUserMusicPlatform = z.infer<typeof insertUserMusicPlatformSchema>;
export type UserMusicPreference = typeof userMusicPreferences.$inferSelect;
export type InsertUserMusicPreference = z.infer<typeof insertUserMusicPreferenceSchema>;
export type PersonalizedRecommendation = typeof personalizedRecommendations.$inferSelect;
export type InsertPersonalizedRecommendation = z.infer<typeof insertPersonalizedRecommendationSchema>;
export type UserListeningHistory = typeof userListeningHistory.$inferSelect;
export type InsertUserListeningHistory = z.infer<typeof insertUserListeningHistorySchema>;
