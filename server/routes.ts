import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertMoodEntrySchema, insertEmotionMessageSchema, insertMusicRecommendationSchema,
  type MoodEntry, type EmotionMessage, type MusicRecommendation 
} from "@shared/schema";
import { z } from "zod";

// Initialize sample data
async function initializeSampleData() {
  try {
    // Add sample mood entries
    const sampleMoods = [
      { 
        happiness: 75, calmness: 80, quickMood: 'peaceful' as const, 
        colorHex: '#87ceeb', colorHsl: 'hsl(197, 71%, 73%)', 
        hue: 197, saturation: 71, lightness: 73, 
        notes: '今天感覺很平靜，看了美麗的夕陽', isAnonymous: 1, 
        country: 'Taiwan', city: 'Taipei' 
      },
      { 
        happiness: 45, calmness: 30, quickMood: 'anxious' as const, 
        colorHex: '#cd853f', colorHsl: 'hsl(30, 57%, 52%)', 
        hue: 30, saturation: 57, lightness: 52, 
        notes: '工作壓力有點大', isAnonymous: 1, 
        country: 'Taiwan', city: 'Kaohsiung' 
      },
      { 
        happiness: 85, calmness: 70, quickMood: 'happy' as const, 
        colorHex: '#ffd700', colorHsl: 'hsl(51, 100%, 50%)', 
        hue: 51, saturation: 100, lightness: 50, 
        notes: '朋友們一起聚餐很開心', isAnonymous: 1, 
        country: 'Taiwan', city: 'Taichung' 
      }
    ];
    
    const sampleMessages = [
      { message: '今天記得要對自己溫柔一點 🌱', isAnonymous: 1 },
      { message: '無論多困難，你都比想像中更堅強', isAnonymous: 1 },
      { message: '深呼吸，這個感受會過去的', isAnonymous: 1 },
      { message: '你的存在本身就很珍貴', isAnonymous: 1 }
    ];
    
    const sampleMusic = [
      { title: '安靜', artist: '周杰倫', genre: '流行', moodType: 'peaceful', youtubeUrl: 'https://youtube.com/watch?v=example1' },
      { title: '聽見下雨的聲音', artist: '魏如昀', genre: '抒情', moodType: 'sad', youtubeUrl: 'https://youtube.com/watch?v=example2' },
      { title: '小幸運', artist: '田馥甄', genre: '流行', moodType: 'happy', youtubeUrl: 'https://youtube.com/watch?v=example3' },
      { title: '夜空中最亮的星', artist: '逃跑計劃', genre: '民謠', moodType: 'calm', youtubeUrl: 'https://youtube.com/watch?v=example4' }
    ];
    
    await Promise.all([
      ...sampleMoods.map(mood => storage.createMoodEntry(mood)),
      ...sampleMessages.map(msg => storage.createEmotionMessage(msg)),
      ...sampleMusic.map(music => storage.createMusicRecommendation(music))
    ]);
    
    console.log('Sample data initialized successfully');
  } catch (error) {
    console.log('Sample data may already exist or initialization failed:', error);
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize sample data on startup
  initializeSampleData();
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

  // Mood twins routes
  app.get("/api/mood/twins", async (req, res) => {
    try {
      const happiness = parseInt(req.query.happiness as string) || 0;
      const calmness = parseInt(req.query.calmness as string) || 0;
      
      // Generate mood twins data based on current mood state
      const mockTwins = [
        {
          id: "1",
          moodEntryId: null,
          musicType: "lo-fi 雨聲",
          twinCount: Math.floor(Math.random() * 15000) + 5000,
          city: "台北",
          timestamp: new Date()
        },
        {
          id: "2", 
          moodEntryId: null,
          musicType: "古典鋼琴",
          twinCount: Math.floor(Math.random() * 8000) + 2000,
          city: "高雄",
          timestamp: new Date()
        },
        {
          id: "3",
          moodEntryId: null, 
          musicType: "冥想音樂",
          twinCount: Math.floor(Math.random() * 6000) + 1500,
          city: "台中",
          timestamp: new Date()
        }
      ];
      
      res.json(mockTwins);
    } catch (error) {
      res.status(500).json({ message: "Failed to get mood twins" });
    }
  });

  app.post("/api/mood/twins/send-warmth", async (req, res) => {
    try {
      const { musicType, message } = req.body;
      
      res.json({ 
        success: true, 
        message: "溫暖已送達，有人會收到你的音樂推薦" 
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to send warmth" });
    }
  });

  // Music recommendation routes
  app.get("/api/music/recommendations", async (req, res) => {
    try {
      const happiness = parseFloat(req.query.happiness as string) || 50;
      const calmness = parseFloat(req.query.calmness as string) || 50;
      
      // Smart mood type determination based on happiness and calmness levels
      let moodType = "happy";
      if (happiness >= 70 && calmness >= 70) {
        moodType = "peaceful";
      } else if (happiness >= 60) {
        moodType = "happy";
      } else if (happiness < 40 && calmness < 40) {
        moodType = "anxious";
      } else if (happiness < 40) {
        moodType = "sad";
      } else if (calmness >= 70) {
        moodType = "calm";
      }
      
      const recommendations = await storage.getMusicRecommendations(moodType);
      
      // If no specific recommendations found, get mixed recommendations
      if (recommendations.length === 0) {
        const fallbackTypes = ["happy", "calm", "peaceful"];
        const allRecommendations = await Promise.all(
          fallbackTypes.map(type => storage.getMusicRecommendations(type))
        );
        const mixed = allRecommendations.flat().slice(0, 5);
        res.json(mixed);
      } else {
        res.json(recommendations);
      }
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
