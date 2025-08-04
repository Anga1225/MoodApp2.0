import { storage } from "../storage";
import type { 
  InsertUserMusicPlatform, 
  InsertUserMusicPreference, 
  InsertPersonalizedRecommendation,
  MoodEntry,
  UserMusicPreference
} from "@shared/schema";

// Spotify API 整合
export class SpotifyService {
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;

  constructor() {
    this.clientId = process.env.SPOTIFY_CLIENT_ID || '';
    this.clientSecret = process.env.SPOTIFY_CLIENT_SECRET || '';
    this.redirectUri = process.env.SPOTIFY_REDIRECT_URI || 'http://localhost:5000/api/auth/spotify/callback';
  }

  // 獲取 Spotify 授權 URL
  getAuthorizationUrl(): string {
    const scopes = [
      'user-read-recently-played',
      'user-top-read',
      'user-read-playback-state',
      'user-library-read',
      'playlist-read-private'
    ].join(' ');

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.clientId,
      scope: scopes,
      redirect_uri: this.redirectUri,
      state: 'moodtune_auth'
    });

    return `https://accounts.spotify.com/authorize?${params.toString()}`;
  }

  // 交換授權碼獲取 access token
  async getAccessToken(code: string): Promise<{access_token: string, refresh_token: string, expires_in: number}> {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')}`
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: this.redirectUri
      })
    });

    if (!response.ok) {
      throw new Error('Failed to get Spotify access token');
    }

    return response.json();
  }

  // 分析用戶音樂喜好
  async analyzeUserPreferences(accessToken: string): Promise<{
    topGenres: string[];
    topArtists: string[];
    energyLevel: number;
    valence: number;
  }> {
    // 獲取用戶最喜愛的歌手和歌曲
    const [topArtistsResponse, topTracksResponse] = await Promise.all([
      fetch('https://api.spotify.com/v1/me/top/artists?limit=20&time_range=medium_term', {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      }),
      fetch('https://api.spotify.com/v1/me/top/tracks?limit=50&time_range=medium_term', {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      })
    ]);

    if (!topArtistsResponse.ok || !topTracksResponse.ok) {
      throw new Error('Failed to fetch Spotify user data');
    }

    const topArtists = await topArtistsResponse.json();
    const topTracks = await topTracksResponse.json();

    // 獲取歌曲音頻特徵
    const trackIds = topTracks.items.map((track: any) => track.id).join(',');
    const audioFeaturesResponse = await fetch(`https://api.spotify.com/v1/audio-features?ids=${trackIds}`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });

    const audioFeatures = await audioFeaturesResponse.json();

    // 分析流派
    const genres = new Map<string, number>();
    topArtists.items.forEach((artist: any) => {
      artist.genres.forEach((genre: string) => {
        genres.set(genre, (genres.get(genre) || 0) + 1);
      });
    });

    const topGenres = Array.from(genres.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([genre]) => genre);

    const topArtistNames = topArtists.items.map((artist: any) => artist.name);

    // 計算平均能量和情緒值
    const validFeatures = audioFeatures.audio_features.filter((f: any) => f !== null);
    const avgEnergy = validFeatures.reduce((sum: number, f: any) => sum + f.energy, 0) / validFeatures.length;
    const avgValence = validFeatures.reduce((sum: number, f: any) => sum + f.valence, 0) / validFeatures.length;

    return {
      topGenres,
      topArtists: topArtistNames,
      energyLevel: avgEnergy,
      valence: avgValence
    };
  }
}

// 音樂推薦引擎
export class MusicRecommendationEngine {
  // 根據情緒和用戶偏好生成個人化推薦
  async generatePersonalizedRecommendations(
    userId: string, 
    moodEntry: MoodEntry,
    userPreferences?: UserMusicPreference
  ): Promise<Array<{
    recommendation: any;
    confidence: number;
    reason: string;
  }>> {
    // 根據情緒映射音樂類型
    const moodType = this.mapMoodToMusicType(moodEntry.happiness, moodEntry.calmness);
    
    // 獲取基礎推薦
    const baseRecommendations = await storage.getMusicRecommendations(moodType);
    
    if (!userPreferences) {
      // 如果沒有用戶偏好，返回基本推薦
      return baseRecommendations.map(rec => ({
        recommendation: rec,
        confidence: 0.5,
        reason: `根據您的心情 (${moodType}) 推薦`
      }));
    }

    // 個人化推薦算法
    const personalizedRecs = baseRecommendations.map(rec => {
      let confidence = 0.5; // 基礎信心度
      let reasons: string[] = [];

      // 根據流派匹配度調整信心度
      if (rec.genre && userPreferences.topGenres.includes(rec.genre)) {
        confidence += 0.2;
        reasons.push('符合您喜愛的音樂類型');
      }

      // 根據藝人匹配度調整信心度
      if (userPreferences.topArtists.includes(rec.artist)) {
        confidence += 0.3;
        reasons.push('您喜愛的藝人');
      }

      // 根據能量水平匹配度調整
      const moodEnergy = this.calculateMoodEnergy(moodEntry.happiness, moodEntry.calmness);
      if (userPreferences.energyLevel !== null) {
        const energyMatch = 1 - Math.abs(moodEnergy - userPreferences.energyLevel);
        confidence += energyMatch * 0.2;
        if (energyMatch > 0.8) reasons.push('能量水平與您的喜好匹配');
      }

      // 根據情緒正負值匹配度調整
      const moodValence = moodEntry.happiness / 100;
      if (userPreferences.valence !== null) {
        const valenceMatch = 1 - Math.abs(moodValence - userPreferences.valence);
        confidence += valenceMatch * 0.2;
        if (valenceMatch > 0.8) reasons.push('情緒氛圍符合您的偏好');
      }



      return {
        recommendation: rec,
        confidence: Math.min(confidence, 1.0),
        reason: reasons.length > 0 ? reasons.join('，') : `根據您的心情推薦`
      };
    });

    // 按信心度排序
    return personalizedRecs.sort((a, b) => b.confidence - a.confidence);
  }

  // 情緒到音樂類型映射
  private mapMoodToMusicType(happiness: number, calmness: number): string {
    if (happiness >= 70 && calmness >= 70) return 'peaceful';
    if (happiness >= 70 && calmness < 50) return 'energetic';
    if (happiness >= 70) return 'happy';
    if (happiness < 30 && calmness < 30) return 'anxious';
    if (happiness < 30) return 'sad';
    if (calmness >= 70) return 'calm';
    if (calmness < 30) return 'energetic';
    return 'contemplative';
  }

  // 計算情緒能量水平
  private calculateMoodEnergy(happiness: number, calmness: number): number {
    // 高興且不平靜 = 高能量
    // 平靜且不太高興 = 低能量
    const energy = (happiness + (100 - calmness)) / 200;
    return Math.max(0, Math.min(1, energy));
  }

  // 映射偏好的情緒類型
  mapPreferencesToMoodTypes(preferences: UserMusicPreference): string[] {
    const moodTypes: string[] = [];
    
    if (preferences.valence !== null) {
      if (preferences.valence > 0.6) {
        moodTypes.push('happy', 'energetic');
      }
      if (preferences.valence < 0.4) {
        moodTypes.push('sad', 'melancholic');
      }
    }
    
    if (preferences.energyLevel !== null) {
      if (preferences.energyLevel > 0.7) {
        moodTypes.push('energetic', 'excited');
      }
      if (preferences.energyLevel < 0.3) {
        moodTypes.push('calm', 'peaceful');
      }
    }
    
    // 根據流派推斷情緒偏好
    const calmGenres = ['classical', 'ambient', 'jazz', '古典', '爵士'];
    const energeticGenres = ['pop', 'rock', 'electronic', 'hip-hop', '流行', '搖滾'];
    
    const hasCalm = preferences.topGenres.some(genre => 
      calmGenres.some(calmGenre => genre.toLowerCase().includes(calmGenre))
    );
    const hasEnergetic = preferences.topGenres.some(genre => 
      energeticGenres.some(energeticGenre => genre.toLowerCase().includes(energeticGenre))
    );
    
    if (hasCalm) moodTypes.push('calm', 'peaceful', 'contemplative');
    if (hasEnergetic) moodTypes.push('energetic', 'happy', 'excited');
    
    return Array.from(new Set(moodTypes)); // 去重
  }
}

// 音樂平台管理服務
export class MusicPlatformManager {
  private spotifyService: SpotifyService;
  private recommendationEngine: MusicRecommendationEngine;

  constructor() {
    this.spotifyService = new SpotifyService();
    this.recommendationEngine = new MusicRecommendationEngine();
  }

  // 連接 Spotify 平台
  async connectSpotify(userId: string, code: string): Promise<void> {
    try {
      const tokenData = await this.spotifyService.getAccessToken(code);
      
      const platformData: InsertUserMusicPlatform = {
        userId,
        platform: 'spotify',
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        expiresAt: new Date(Date.now() + tokenData.expires_in * 1000),
        isConnected: 1
      };

      await storage.createUserMusicPlatform(platformData);
    } catch (error) {
      console.error('Failed to connect Spotify:', error);
      throw error;
    }
  }

  // 分析並更新用戶音樂偏好
  async analyzeUserMusicPreferences(userId: string): Promise<void> {
    try {
      const platform = await storage.getUserMusicPlatform(userId, 'spotify');
      if (!platform || !platform.accessToken) {
        throw new Error('Spotify not connected');
      }

      const preferences = await this.spotifyService.analyzeUserPreferences(platform.accessToken);
      const moodTypes = this.recommendationEngine.mapPreferencesToMoodTypes({
        ...preferences,
        id: '',
        userId,
        preferredMoodTypes: [],
        lastAnalyzed: new Date(),
        updatedAt: new Date()
      });

      const preferenceData: InsertUserMusicPreference = {
        userId,
        topGenres: preferences.topGenres,
        topArtists: preferences.topArtists,
        preferredMoodTypes: moodTypes,
        energyLevel: preferences.energyLevel,
        valence: preferences.valence
      };

      await storage.createOrUpdateUserMusicPreference(preferenceData);
    } catch (error) {
      console.error('Failed to analyze user preferences:', error);
      throw error;
    }
  }

  // 生成個人化推薦
  async getPersonalizedRecommendations(userId: string, moodEntry: MoodEntry): Promise<any[]> {
    try {
      const userPreferences = await storage.getUserMusicPreferences(userId);
      const recommendations = await this.recommendationEngine.generatePersonalizedRecommendations(
        userId, 
        moodEntry, 
        userPreferences
      );

      // 保存推薦記錄
      for (const rec of recommendations.slice(0, 5)) { // 只保存前5個推薦
        const personalizedRec: InsertPersonalizedRecommendation = {
          userId,
          musicRecommendationId: rec.recommendation.id,
          moodEntryId: moodEntry.id,
          confidence: rec.confidence,
          reason: rec.reason,
          wasPlayed: 0,
          wasLiked: 0
        };
        await storage.createPersonalizedRecommendation(personalizedRec);
      }

      return recommendations;
    } catch (error) {
      console.error('Failed to get personalized recommendations:', error);
      throw error;
    }
  }

  getSpotifyAuthUrl(): string {
    return this.spotifyService.getAuthorizationUrl();
  }
}

export const musicPlatformManager = new MusicPlatformManager();