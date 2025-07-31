import { 
  users, moodEntries, emotionMessages, musicRecommendations,
  type User, type InsertUser, type MoodEntry, type InsertMoodEntry,
  type EmotionMessage, type InsertEmotionMessage,
  type MusicRecommendation, type InsertMusicRecommendation
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql, and } from "drizzle-orm";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Mood entry operations
  createMoodEntry(entry: InsertMoodEntry): Promise<MoodEntry>;
  getMoodEntries(userId?: string, limit?: number, skip?: number): Promise<MoodEntry[]>;
  getMoodEntry(id: string): Promise<MoodEntry | undefined>;
  updateMoodEntry(id: string, entry: Partial<InsertMoodEntry>): Promise<MoodEntry | undefined>;
  deleteMoodEntry(id: string): Promise<boolean>;
  getRecentMoodEntries(userId?: string, limit?: number): Promise<MoodEntry[]>;
  getGlobalMoodEntries(limit?: number): Promise<MoodEntry[]>;
  
  // Emotion messages operations
  createEmotionMessage(message: InsertEmotionMessage): Promise<EmotionMessage>;
  getEmotionMessages(moodEntryId?: string, limit?: number): Promise<EmotionMessage[]>;
  supportEmotionMessage(id: string): Promise<boolean>;
  
  // Music recommendations operations
  getMusicRecommendations(moodType: string): Promise<MusicRecommendation[]>;
  createMusicRecommendation(recommendation: InsertMusicRecommendation): Promise<MusicRecommendation>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private moodEntries: Map<string, MoodEntry>;
  private emotionMessages: Map<string, EmotionMessage>;
  private musicRecommendations: Map<string, MusicRecommendation>;

  constructor() {
    this.users = new Map();
    this.moodEntries = new Map();
    this.emotionMessages = new Map();
    this.musicRecommendations = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createMoodEntry(insertEntry: InsertMoodEntry): Promise<MoodEntry> {
    const id = randomUUID();
    const now = new Date();
    const entry: MoodEntry = {
      id,
      userId: insertEntry.userId || null,
      happiness: insertEntry.happiness,
      calmness: insertEntry.calmness,
      quickMood: insertEntry.quickMood || null,
      colorHex: insertEntry.colorHex,
      colorHsl: insertEntry.colorHsl,
      hue: insertEntry.hue,
      saturation: insertEntry.saturation,
      lightness: insertEntry.lightness,
      notes: insertEntry.notes || null,
      isAnonymous: insertEntry.isAnonymous || 0,
      country: insertEntry.country || null,
      city: insertEntry.city || null,
      timestamp: now,
      createdAt: now,
    };
    this.moodEntries.set(id, entry);
    return entry;
  }

  async getMoodEntries(userId?: string, limit = 50, skip = 0): Promise<MoodEntry[]> {
    let entries = Array.from(this.moodEntries.values());
    
    if (userId) {
      entries = entries.filter(entry => entry.userId === userId);
    }
    
    entries.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    return entries.slice(skip, skip + limit);
  }

  async getMoodEntry(id: string): Promise<MoodEntry | undefined> {
    return this.moodEntries.get(id);
  }

  async updateMoodEntry(id: string, updateData: Partial<InsertMoodEntry>): Promise<MoodEntry | undefined> {
    const entry = this.moodEntries.get(id);
    if (!entry) return undefined;
    
    const updatedEntry = { ...entry, ...updateData };
    this.moodEntries.set(id, updatedEntry);
    return updatedEntry;
  }

  async deleteMoodEntry(id: string): Promise<boolean> {
    return this.moodEntries.delete(id);
  }

  async getRecentMoodEntries(userId?: string, limit = 10): Promise<MoodEntry[]> {
    return this.getMoodEntries(userId, limit, 0);
  }

  async getGlobalMoodEntries(limit = 50): Promise<MoodEntry[]> {
    const entries = Array.from(this.moodEntries.values())
      .filter(entry => entry.isAnonymous === 1)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
    return entries;
  }

  async createEmotionMessage(insertMessage: InsertEmotionMessage): Promise<EmotionMessage> {
    const id = randomUUID();
    const now = new Date();
    const message: EmotionMessage = {
      id,
      moodEntryId: insertMessage.moodEntryId || null,
      message: insertMessage.message,
      isAnonymous: insertMessage.isAnonymous || 1,
      supportCount: 0,
      city: insertMessage.city || null,
      timestamp: now,
    };
    this.emotionMessages.set(id, message);
    return message;
  }

  async getEmotionMessages(moodEntryId?: string, limit = 20): Promise<EmotionMessage[]> {
    let messages = Array.from(this.emotionMessages.values());
    
    if (moodEntryId) {
      messages = messages.filter(message => message.moodEntryId === moodEntryId);
    }
    
    messages.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    return messages.slice(0, limit);
  }

  async supportEmotionMessage(id: string): Promise<boolean> {
    const message = this.emotionMessages.get(id);
    if (!message) return false;
    
    message.supportCount += 1;
    this.emotionMessages.set(id, message);
    return true;
  }

  async getMusicRecommendations(moodType: string): Promise<MusicRecommendation[]> {
    const recommendations = Array.from(this.musicRecommendations.values())
      .filter(rec => rec.moodType === moodType && rec.isActive === 1)
      .slice(0, 10);
    return recommendations;
  }

  async createMusicRecommendation(insertRecommendation: InsertMusicRecommendation): Promise<MusicRecommendation> {
    const id = randomUUID();
    const recommendation: MusicRecommendation = {
      id,
      title: insertRecommendation.title,
      artist: insertRecommendation.artist,
      genre: insertRecommendation.genre || null,
      moodType: insertRecommendation.moodType,
      spotifyUrl: insertRecommendation.spotifyUrl || null,
      youtubeUrl: insertRecommendation.youtubeUrl || null,
      isActive: insertRecommendation.isActive || 1,
    };
    this.musicRecommendations.set(id, recommendation);
    return recommendation;
  }
}

// Database Storage Implementation
export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async createMoodEntry(insertEntry: InsertMoodEntry): Promise<MoodEntry> {
    const [entry] = await db
      .insert(moodEntries)
      .values(insertEntry)
      .returning();
    return entry;
  }

  async getMoodEntries(userId?: string, limit = 50, skip = 0): Promise<MoodEntry[]> {
    if (userId) {
      const entries = await db
        .select()
        .from(moodEntries)
        .where(eq(moodEntries.userId, userId))
        .orderBy(desc(moodEntries.timestamp))
        .limit(limit)
        .offset(skip);
      return entries;
    } else {
      const entries = await db
        .select()
        .from(moodEntries)
        .orderBy(desc(moodEntries.timestamp))
        .limit(limit)
        .offset(skip);
      return entries;
    }
  }

  async getMoodEntry(id: string): Promise<MoodEntry | undefined> {
    const [entry] = await db.select().from(moodEntries).where(eq(moodEntries.id, id));
    return entry || undefined;
  }

  async updateMoodEntry(id: string, updateData: Partial<InsertMoodEntry>): Promise<MoodEntry | undefined> {
    const [entry] = await db
      .update(moodEntries)
      .set(updateData)
      .where(eq(moodEntries.id, id))
      .returning();
    return entry || undefined;
  }

  async deleteMoodEntry(id: string): Promise<boolean> {
    const result = await db.delete(moodEntries).where(eq(moodEntries.id, id));
    return (result as any).rowCount > 0;
  }

  async getRecentMoodEntries(userId?: string, limit = 10): Promise<MoodEntry[]> {
    return this.getMoodEntries(userId, limit, 0);
  }

  async getGlobalMoodEntries(limit = 50): Promise<MoodEntry[]> {
    const entries = await db
      .select()
      .from(moodEntries)
      .where(eq(moodEntries.isAnonymous, 1))
      .orderBy(desc(moodEntries.timestamp))
      .limit(limit);
    return entries;
  }

  async createEmotionMessage(insertMessage: InsertEmotionMessage): Promise<EmotionMessage> {
    const [message] = await db
      .insert(emotionMessages)
      .values(insertMessage)
      .returning();
    return message;
  }

  async getEmotionMessages(moodEntryId?: string, limit = 20): Promise<EmotionMessage[]> {
    if (moodEntryId) {
      const messages = await db
        .select()
        .from(emotionMessages)
        .where(eq(emotionMessages.moodEntryId, moodEntryId))
        .orderBy(desc(emotionMessages.timestamp))
        .limit(limit);
      return messages;
    } else {
      const messages = await db
        .select()
        .from(emotionMessages)
        .orderBy(desc(emotionMessages.timestamp))
        .limit(limit);
      return messages;
    }
  }

  async supportEmotionMessage(id: string): Promise<boolean> {
    const result = await db
      .update(emotionMessages)
      .set({
        supportCount: sql`${emotionMessages.supportCount} + 1`
      })
      .where(eq(emotionMessages.id, id));
    return (result as any).rowCount > 0;
  }

  async getMusicRecommendations(moodType: string): Promise<MusicRecommendation[]> {
    const recommendations = await db
      .select()
      .from(musicRecommendations)
      .where(and(
        eq(musicRecommendations.moodType, moodType),
        eq(musicRecommendations.isActive, 1)
      ))
      .limit(10);
    return recommendations;
  }

  async createMusicRecommendation(insertRecommendation: InsertMusicRecommendation): Promise<MusicRecommendation> {
    const [recommendation] = await db
      .insert(musicRecommendations)
      .values(insertRecommendation)
      .returning();
    return recommendation;
  }
}

export const storage = new DatabaseStorage();
