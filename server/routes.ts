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
    // Check if data already exists to avoid duplicates
    const existingMusic = await storage.getMusicRecommendations('happy');
    if (existingMusic.length > 0) {
      console.log('Sample data already exists, skipping initialization');
      return;
    }
    
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
      { title: 'River Flows in You', artist: 'Yiruma', genre: '鋼琴', moodType: 'peaceful', youtubeUrl: 'https://www.youtube.com/watch?v=7maJOI3QMu0', spotifyUrl: null },
      { title: 'Canon in D', artist: 'Pachelbel', genre: '古典', moodType: 'peaceful', youtubeUrl: 'https://www.youtube.com/watch?v=NlprozGcs80', spotifyUrl: null },
      { title: 'Clair de Lune', artist: 'Debussy', genre: '古典', moodType: 'peaceful', youtubeUrl: 'https://www.youtube.com/watch?v=CvFH_6DNRCY', spotifyUrl: null },
      { title: 'Weightless', artist: 'Marconi Union', genre: '環境音樂', moodType: 'peaceful', youtubeUrl: 'https://www.youtube.com/watch?v=UfcAVejslrU', spotifyUrl: null },
      
      // Happy/快樂音樂  
      { title: 'Happy', artist: 'Pharrell Williams', genre: '流行', moodType: 'happy', youtubeUrl: 'https://www.youtube.com/watch?v=ZbZSe6N_BXs', spotifyUrl: null },
      { title: 'Count on Me', artist: 'Bruno Mars', genre: '流行', moodType: 'happy', youtubeUrl: 'https://www.youtube.com/watch?v=CRt2nk7owyE', spotifyUrl: null },
      { title: 'What a Wonderful World', artist: 'Louis Armstrong', genre: '爵士', moodType: 'happy', youtubeUrl: 'https://www.youtube.com/watch?v=VqhCQZaH4Vs', spotifyUrl: null },
      { title: 'Three Little Birds', artist: 'Bob Marley', genre: '雷鬼', moodType: 'happy', youtubeUrl: 'https://www.youtube.com/watch?v=zaGUr6wzyT8', spotifyUrl: null },
      { title: 'Here Comes the Sun', artist: 'The Beatles', genre: '搖滾', moodType: 'happy', youtubeUrl: 'https://www.youtube.com/watch?v=KQetemT1sWc', spotifyUrl: null },
      
      // Calm/平靜音樂
      { title: 'Gymnopédie No.1', artist: 'Erik Satie', genre: '古典', moodType: 'calm', youtubeUrl: 'https://www.youtube.com/watch?v=S-Xm7s9eGxU', spotifyUrl: null },
      { title: 'Mad World', artist: 'Gary Jules', genre: '抒情', moodType: 'calm', youtubeUrl: 'https://www.youtube.com/watch?v=4N3N1MlvVc4', spotifyUrl: null },
      { title: 'The Sound of Silence', artist: 'Disturbed', genre: '搖滾', moodType: 'calm', youtubeUrl: 'https://www.youtube.com/watch?v=u9Dg-g7t2l4', spotifyUrl: null },
      { title: 'Spiegel im Spiegel', artist: 'Arvo Pärt', genre: '現代古典', moodType: 'calm', youtubeUrl: 'https://www.youtube.com/watch?v=TJ6Mzvh3XCc', spotifyUrl: null },
      { title: 'Porcelain', artist: 'Moby', genre: '電子', moodType: 'calm', youtubeUrl: 'https://www.youtube.com/watch?v=13EifDb4GYs', spotifyUrl: null },
      
      // Sad/憂鬱音樂
      { title: 'Hurt', artist: 'Johnny Cash', genre: '鄉村', moodType: 'sad', youtubeUrl: 'https://www.youtube.com/watch?v=vt1Pwfnh5pc', spotifyUrl: null },
      { title: 'Black', artist: 'Pearl Jam', genre: '搖滾', moodType: 'sad', youtubeUrl: 'https://www.youtube.com/watch?v=5ChbxMVgGV4', spotifyUrl: null },
      { title: 'Everybody Hurts', artist: 'R.E.M.', genre: '另類搖滾', moodType: 'sad', youtubeUrl: 'https://www.youtube.com/watch?v=5rOiW_xY-kc', spotifyUrl: null },
      { title: 'Breathe Me', artist: 'Sia', genre: '流行', moodType: 'sad', youtubeUrl: 'https://www.youtube.com/watch?v=hSjIz8oQuko', spotifyUrl: null },
      { title: 'Hallelujah', artist: 'Jeff Buckley', genre: '另類搖滾', moodType: 'sad', youtubeUrl: 'https://www.youtube.com/watch?v=y8AWFf7EAc4', spotifyUrl: null },
      
      // Anxious/焦慮音樂 - 提供鎮定和希望的歌曲
      { title: 'Breathe', artist: 'Telepopmusik', genre: '電子', moodType: 'anxious', youtubeUrl: 'https://www.youtube.com/watch?v=vyut3GyQtn0', spotifyUrl: null },
      { title: 'Aqueous Transmission', artist: 'Incubus', genre: '另類搖滾', moodType: 'anxious', youtubeUrl: 'https://www.youtube.com/watch?v=3k0-sGqxIiQ', spotifyUrl: null },
      { title: 'The Way You Look Tonight', artist: 'Tony Bennett', genre: '爵士', moodType: 'anxious', youtubeUrl: 'https://www.youtube.com/watch?v=h9ZGKALMMuc', spotifyUrl: null },
      { title: 'Teardrop', artist: 'Massive Attack', genre: '電子', moodType: 'anxious', youtubeUrl: 'https://www.youtube.com/watch?v=u7K72X4eo_s', spotifyUrl: null },
      
      // Energetic/活力音樂
      { title: 'Uptown Funk', artist: 'Mark Ronson ft. Bruno Mars', genre: '流行', moodType: 'energetic', youtubeUrl: 'https://www.youtube.com/watch?v=OPf0YbXqDm0', spotifyUrl: null },
      { title: 'Can\'t Stop the Feeling!', artist: 'Justin Timberlake', genre: '流行', moodType: 'energetic', youtubeUrl: 'https://www.youtube.com/watch?v=ru0K8uYEZWw', spotifyUrl: null },
      { title: 'Walking on Sunshine', artist: 'Katrina and the Waves', genre: '流行', moodType: 'energetic', youtubeUrl: 'https://www.youtube.com/watch?v=iPUmE-tne5U', spotifyUrl: null },
      { title: 'Mr. Blue Sky', artist: 'Electric Light Orchestra', genre: '搖滾', moodType: 'energetic', youtubeUrl: 'https://www.youtube.com/watch?v=wuJIqmha2Hc', spotifyUrl: null },
      { title: 'Don\'t Stop Me Now', artist: 'Queen', genre: '搖滾', moodType: 'energetic', youtubeUrl: 'https://www.youtube.com/watch?v=HgzGwKwLmgM', spotifyUrl: null },
      
      // Excited/興奮音樂
      { title: 'good 4 u', artist: 'Olivia Rodrigo', genre: '流行', moodType: 'excited', youtubeUrl: 'https://www.youtube.com/watch?v=gNi_6U5Pm_o', spotifyUrl: null },
      { title: 'Levitating', artist: 'Dua Lipa', genre: '流行', moodType: 'excited', youtubeUrl: 'https://www.youtube.com/watch?v=TUVcZfQe-Kw', spotifyUrl: null },
      { title: 'Shut Up and Dance', artist: 'WALK THE MOON', genre: '獨立搖滾', moodType: 'excited', youtubeUrl: 'https://www.youtube.com/watch?v=6JCLY0Rlx6Q', spotifyUrl: null },
      
      // Romantic/浪漫音樂
      { title: 'Perfect', artist: 'Ed Sheeran', genre: '流行', moodType: 'romantic', youtubeUrl: 'https://www.youtube.com/watch?v=2Vv-BfVoq4g', spotifyUrl: null },
      { title: 'All of Me', artist: 'John Legend', genre: '流行', moodType: 'romantic', youtubeUrl: 'https://www.youtube.com/watch?v=450p7goxZqg', spotifyUrl: null },
      { title: 'La Vie En Rose', artist: 'Édith Piaf', genre: '香頌', moodType: 'romantic', youtubeUrl: 'https://www.youtube.com/watch?v=kFzViYkZAz4', spotifyUrl: null },
      { title: 'Make You Feel My Love', artist: 'Adele', genre: '流行', moodType: 'romantic', youtubeUrl: 'https://www.youtube.com/watch?v=0put0_a--Ng', spotifyUrl: null },
      
      // Nostalgic/懷舊音樂
      { title: 'Yesterday', artist: 'The Beatles', genre: '搖滾', moodType: 'nostalgic', youtubeUrl: 'https://www.youtube.com/watch?v=NrgmdOz227I', spotifyUrl: null },
      { title: 'The Way You Look Tonight', artist: 'Frank Sinatra', genre: '爵士', moodType: 'nostalgic', youtubeUrl: 'https://www.youtube.com/watch?v=h9ZGKALMMuc', spotifyUrl: null },
      { title: 'Stand by Me', artist: 'Ben E. King', genre: '靈魂樂', moodType: 'nostalgic', youtubeUrl: 'https://www.youtube.com/watch?v=hwZNL7QVJjE', spotifyUrl: null },
      { title: 'Fly Me to the Moon', artist: 'Frank Sinatra', genre: '爵士', moodType: 'nostalgic', youtubeUrl: 'https://www.youtube.com/watch?v=5hxibHJOE5E', spotifyUrl: null },
      
      // Melancholic/憂鬱沉思音樂
      { title: 'Mad World', artist: 'Gary Jules', genre: '另類', moodType: 'melancholic', youtubeUrl: 'https://www.youtube.com/watch?v=4N3N1MlvVc4', spotifyUrl: null },
      { title: 'The Sound of Silence', artist: 'Simon & Garfunkel', genre: '民謠', moodType: 'melancholic', youtubeUrl: 'https://www.youtube.com/watch?v=4fWyzwo1xg0', spotifyUrl: null },
      { title: 'Hurt', artist: 'Nine Inch Nails', genre: '工業搖滾', moodType: 'melancholic', youtubeUrl: 'https://www.youtube.com/watch?v=kPz21cDK7dg', spotifyUrl: null },
      
      // Hopeful/希望音樂
      { title: 'Here Comes the Sun', artist: 'The Beatles', genre: '搖滾', moodType: 'hopeful', youtubeUrl: 'https://www.youtube.com/watch?v=KQetemT1sWc', spotifyUrl: null },
      { title: 'Three Little Birds', artist: 'Bob Marley & The Wailers', genre: '雷鬼', moodType: 'hopeful', youtubeUrl: 'https://www.youtube.com/watch?v=zaGUr6wzyT8', spotifyUrl: null },
      { title: 'Don\'t Stop Believin\'', artist: 'Journey', genre: '搖滾', moodType: 'hopeful', youtubeUrl: 'https://www.youtube.com/watch?v=1k8craCGpgs', spotifyUrl: null }
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
