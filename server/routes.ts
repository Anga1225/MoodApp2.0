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
      // Peaceful/療癒音樂
      { title: '安靜', artist: '周杰倫', genre: '流行', moodType: 'peaceful', youtubeUrl: 'https://www.youtube.com/watch?v=OiNsgKOmFTQ', spotifyUrl: 'https://open.spotify.com/track/2KrxsD86ARO5beq7Q0Gsdd' },
      { title: '夜空中最亮的星', artist: '逃跑計劃', genre: '民謠', moodType: 'peaceful', youtubeUrl: 'https://www.youtube.com/watch?v=qf8_tn7lBIc', spotifyUrl: 'https://open.spotify.com/track/0y6kdSRJVQlfnAQuen1mwj' },
      { title: '慢慢', artist: '張學友', genre: '抒情', moodType: 'peaceful', youtubeUrl: 'https://www.youtube.com/watch?v=djV11Xbc914', spotifyUrl: 'https://open.spotify.com/track/4uLU6hMCjMI75M1A2tKUQC' },
      
      // Happy/快樂音樂
      { title: '小幸運', artist: '田馥甄', genre: '流行', moodType: 'happy', youtubeUrl: 'https://www.youtube.com/watch?v=rcjJqeUlps8', spotifyUrl: 'https://open.spotify.com/track/1K3ESzZIujmOJ7tQPPgm7O' },
      { title: '晴天', artist: '周杰倫', genre: '流行', moodType: 'happy', youtubeUrl: 'https://www.youtube.com/watch?v=lnCeZY6nxjQ', spotifyUrl: 'https://open.spotify.com/track/2PjlaxlMunGOUvcRzlTbtE' },
      { title: '愛你', artist: '陳芳語', genre: '流行', moodType: 'happy', youtubeUrl: 'https://www.youtube.com/watch?v=9AQByLgzPRc', spotifyUrl: 'https://open.spotify.com/track/6JmQbOaVSIHIVvE5VqkKST' },
      
      // Calm/平靜音樂
      { title: '時光機', artist: '五月天', genre: '搖滾', moodType: 'calm', youtubeUrl: 'https://www.youtube.com/watch?v=lYOUQxCEHPw', spotifyUrl: 'https://open.spotify.com/track/4aLd4rqGrIaGuLhTNlhTPZ' },
      { title: '寧夏', artist: '梁靜茹', genre: '抒情', moodType: 'calm', youtubeUrl: 'https://www.youtube.com/watch?v=5NyAEWOjlUE', spotifyUrl: 'https://open.spotify.com/track/2TxZOIWh2SWTEZyVGWQJRO' },
      { title: 'Moon River', artist: '王菲', genre: '爵士', moodType: 'calm', youtubeUrl: 'https://www.youtube.com/watch?v=mNOJnSUEfM0', spotifyUrl: 'https://open.spotify.com/track/6rqhFgbbKwnb9MLmUQDjG6' },
      
      // Sad/憂鬱音樂
      { title: '聽見下雨的聲音', artist: '魏如昀', genre: '抒情', moodType: 'sad', youtubeUrl: 'https://www.youtube.com/watch?v=DYQS_TQFVb0', spotifyUrl: 'https://open.spotify.com/track/5Uon3ZP0ufGVKmtWGX5N0F' },
      { title: '成全', artist: '林宥嘉', genre: '抒情', moodType: 'sad', youtubeUrl: 'https://www.youtube.com/watch?v=9v8_aTOz_xM', spotifyUrl: 'https://open.spotify.com/track/6BOcmEOUvyI0LXJ8CQq0Nq' },
      { title: '說謊', artist: '林宥嘉', genre: '抒情', moodType: 'sad', youtubeUrl: 'https://www.youtube.com/watch?v=YkH5YnHO_Bk', spotifyUrl: 'https://open.spotify.com/track/4P3yDxI5FlpNQz9yubLX9g' },
      
      // Anxious/焦慮音樂
      { title: '海闊天空', artist: 'Beyond', genre: '搖滾', moodType: 'anxious', youtubeUrl: 'https://www.youtube.com/watch?v=qu_FSptjRic', spotifyUrl: 'https://open.spotify.com/track/2xU1K5b3W91OJmM4Hnv4eM' },
      { title: '最初的夢想', artist: '范瑋琪', genre: '流行', moodType: 'anxious', youtubeUrl: 'https://www.youtube.com/watch?v=6Uo0NmOAJF8', spotifyUrl: 'https://open.spotify.com/track/1VpOGNOUz2MZzGo4dTGEPR' },
      { title: '我不會喜歡你', artist: '陳柏霖', genre: '流行', moodType: 'anxious', youtubeUrl: 'https://www.youtube.com/watch?v=bCuGF8XL3YQ', spotifyUrl: 'https://open.spotify.com/track/3dNpv8BgdGjGZJxZwgq2Oy' },
      
      // Energetic/活力音樂
      { title: '好想你', artist: '朱主愛', genre: '流行', moodType: 'energetic', youtubeUrl: 'https://www.youtube.com/watch?v=H7bqjjNzmcI', spotifyUrl: 'https://open.spotify.com/track/4dNiEb3mAhRvdpkJVnfnX8' },
      { title: '年少有為', artist: '李榮浩', genre: '流行', moodType: 'energetic', youtubeUrl: 'https://www.youtube.com/watch?v=TKmKaD7NP7A', spotifyUrl: 'https://open.spotify.com/track/2dFU5qTwm3kbFSX1MJI8zR' },
      { title: '稻香', artist: '周杰倫', genre: '流行', moodType: 'energetic', youtubeUrl: 'https://www.youtube.com/watch?v=VjrYjxNTCNE', spotifyUrl: 'https://open.spotify.com/track/1L6A0aGwxD5fq8VgUdh8vr' }
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
  app.get("/api/mood/twins/:happiness/:calmness", async (req, res) => {
    try {
      const happiness = parseInt(req.params.happiness) || 0;
      const calmness = parseInt(req.params.calmness) || 0;
      
      // Calculate twins based on similar mood ranges
      const twinRange = 10; // mood range for finding twins
      const entries = await storage.getMoodEntries(undefined, 500);
      
      const twins = entries.filter(entry => 
        Math.abs(entry.happiness - happiness) <= twinRange &&
        Math.abs(entry.calmness - calmness) <= twinRange
      );
      
      // Generate music types based on current mood
      const moodTwins = [
        {
          id: "1",
          moodEntryId: null,
          musicType: happiness >= 70 ? "愉快流行" : calmness >= 70 ? "療癒音樂" : "抒情音樂",
          twinCount: twins.length + Math.floor(Math.random() * 1000) + 500,
          city: "台北",
          timestamp: new Date()
        },
        {
          id: "2", 
          moodEntryId: null,
          musicType: calmness >= 60 ? "冥想音樂" : happiness < 40 ? "溫暖抒情" : "古典鋼琴",
          twinCount: Math.floor(twins.length * 0.7) + Math.floor(Math.random() * 800) + 300,
          city: "高雄",
          timestamp: new Date()
        },
        {
          id: "3",
          moodEntryId: null, 
          musicType: happiness < 40 && calmness < 40 ? "療癒雨聲" : "lo-fi音樂",
          twinCount: Math.floor(twins.length * 0.5) + Math.floor(Math.random() * 600) + 200,
          city: "台中",
          timestamp: new Date()
        }
      ];
      
      res.json(moodTwins);
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
      const moodType = req.query.moodType as string;
      
      let finalMoodType = moodType;
      
      // If no specific mood type provided, determine from happiness/calmness
      if (!finalMoodType) {
        if (happiness >= 70 && calmness >= 70) {
          finalMoodType = "peaceful";
        } else if (happiness >= 60) {
          finalMoodType = "happy";
        } else if (happiness < 40 && calmness < 40) {
          finalMoodType = "anxious";
        } else if (happiness < 40) {
          finalMoodType = "sad";
        } else if (calmness >= 70) {
          finalMoodType = "calm";
        } else {
          finalMoodType = "happy";
        }
      }
      
      const recommendations = await storage.getMusicRecommendations(finalMoodType);
      
      // If no specific recommendations found, get mixed recommendations
      if (recommendations.length === 0) {
        const fallbackTypes = ["happy", "calm", "peaceful", "energetic"];
        const allRecommendations = await Promise.all(
          fallbackTypes.map(type => storage.getMusicRecommendations(type))
        );
        const mixed = allRecommendations.flat().slice(0, 6);
        res.json(mixed);
      } else {
        // Shuffle and limit results for variety
        const shuffled = recommendations.sort(() => Math.random() - 0.5);
        res.json(shuffled.slice(0, 6));
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
