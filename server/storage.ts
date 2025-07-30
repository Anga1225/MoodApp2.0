import { type User, type InsertUser, type MoodEntry, type InsertMoodEntry } from "@shared/schema";
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
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private moodEntries: Map<string, MoodEntry>;

  constructor() {
    this.users = new Map();
    this.moodEntries = new Map();
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
}

export const storage = new MemStorage();
