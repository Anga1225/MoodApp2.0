import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertMoodEntrySchema, insertEmotionMessageSchema, insertMusicRecommendationSchema,
  type MoodEntry, type EmotionMessage, type MusicRecommendation 
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Mood entry routes
  app.post("/api/mood/entries", async (req, res) => {
    try {
      const entryData = insertMoodEntrySchema.parse(req.body);
      const entry = await storage.createMoodEntry(entryData);
      res.json(entry);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid mood entry data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create mood entry" });
      }
    }
  });

  app.get("/api/mood/entries", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const skip = parseInt(req.query.skip as string) || 0;
      const userId = req.query.userId as string;
      
      const entries = await storage.getMoodEntries(userId, limit, skip);
      res.json(entries);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch mood entries" });
    }
  });

  app.get("/api/mood/entries/recent", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const userId = req.query.userId as string;
      
      const entries = await storage.getRecentMoodEntries(userId, limit);
      res.json(entries);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch recent mood entries" });
    }
  });

  app.get("/api/mood/entries/:id", async (req, res) => {
    try {
      const entry = await storage.getMoodEntry(req.params.id);
      if (!entry) {
        res.status(404).json({ message: "Mood entry not found" });
        return;
      }
      res.json(entry);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch mood entry" });
    }
  });

  app.put("/api/mood/entries/:id", async (req, res) => {
    try {
      const updateData = insertMoodEntrySchema.partial().parse(req.body);
      const entry = await storage.updateMoodEntry(req.params.id, updateData);
      if (!entry) {
        res.status(404).json({ message: "Mood entry not found" });
        return;
      }
      res.json(entry);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid update data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update mood entry" });
      }
    }
  });

  app.delete("/api/mood/entries/:id", async (req, res) => {
    try {
      const success = await storage.deleteMoodEntry(req.params.id);
      if (!success) {
        res.status(404).json({ message: "Mood entry not found" });
        return;
      }
      res.json({ message: "Mood entry deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete mood entry" });
    }
  });

  // Analytics routes
  app.get("/api/mood/analytics/trends", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      const entries = await storage.getMoodEntries(userId, 100);
      
      if (entries.length === 0) {
        res.json({
          averageHappiness: 0,
          averageCalmness: 0,
          totalEntries: 0,
          trends: []
        });
        return;
      }

      const averageHappiness = entries.reduce((sum, entry) => sum + entry.happiness, 0) / entries.length;
      const averageCalmness = entries.reduce((sum, entry) => sum + entry.calmness, 0) / entries.length;
      
      res.json({
        averageHappiness: Math.round(averageHappiness),
        averageCalmness: Math.round(averageCalmness),
        totalEntries: entries.length,
        trends: entries.slice(0, 30).map(entry => ({
          date: entry.timestamp,
          happiness: entry.happiness,
          calmness: entry.calmness
        }))
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to generate analytics" });
    }
  });

  // Global emotion wall routes
  app.get("/api/emotions/global", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const entries = await storage.getGlobalMoodEntries(limit);
      res.json(entries);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch global emotions" });
    }
  });

  // Emotion messages routes
  app.post("/api/emotions/messages", async (req, res) => {
    try {
      const messageData = insertEmotionMessageSchema.parse(req.body);
      const message = await storage.createEmotionMessage(messageData);
      res.json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid message data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create emotion message" });
      }
    }
  });

  app.get("/api/emotions/messages", async (req, res) => {
    try {
      const moodEntryId = req.query.moodEntryId as string;
      const limit = parseInt(req.query.limit as string) || 20;
      const messages = await storage.getEmotionMessages(moodEntryId, limit);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch emotion messages" });
    }
  });

  app.post("/api/emotions/messages/:id/support", async (req, res) => {
    try {
      const success = await storage.supportEmotionMessage(req.params.id);
      if (!success) {
        res.status(404).json({ message: "Message not found" });
        return;
      }
      res.json({ message: "Support added successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to add support" });
    }
  });

  // Music recommendation routes
  app.get("/api/music/recommendations", async (req, res) => {
    try {
      const moodType = req.query.moodType as string || "happy";
      const recommendations = await storage.getMusicRecommendations(moodType);
      res.json(recommendations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch music recommendations" });
    }
  });

  app.post("/api/music/recommendations", async (req, res) => {
    try {
      const recommendationData = insertMusicRecommendationSchema.parse(req.body);
      const recommendation = await storage.createMusicRecommendation(recommendationData);
      res.json(recommendation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid recommendation data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create music recommendation" });
      }
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
