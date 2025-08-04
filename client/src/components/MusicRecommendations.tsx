import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { Play, ExternalLink, Music, Sparkles, Settings } from 'lucide-react';
import { Link } from 'wouter';
import type { MusicRecommendation } from '@shared/schema';

interface MusicRecommendationsProps {
  happiness?: number;
  calmness?: number;
  moodType?: string;
}

export function MusicRecommendations({ happiness = 50, calmness = 50, moodType }: MusicRecommendationsProps) {
  // Determine mood type from happiness/calmness values
  const getCurrentMoodType = () => {
    // Euphoric - very high happiness and energy
    if (happiness >= 90 && calmness <= 30) return 'euphoric';
    // Empowering - high happiness, moderate energy
    else if (happiness >= 80 && calmness >= 40 && calmness <= 60) return 'empowering';
    // Peaceful - high happiness and high calmness
    else if (happiness >= 70 && calmness >= 80) return 'peaceful';
    // Hopeful - moderately high happiness
    else if (happiness >= 70 && calmness >= 50 && calmness <= 80) return 'hopeful';
    // Energetic - high happiness, low calmness
    else if (happiness >= 65 && calmness <= 40) return 'energetic';
    // Excited - moderate to high happiness, very low calmness
    else if (happiness >= 60 && calmness <= 30) return 'excited';
    // Playful - moderate happiness, moderate energy
    else if (happiness >= 60 && calmness >= 30 && calmness <= 50) return 'playful';
    // Happy - general good mood
    else if (happiness >= 60) return 'happy';
    // Motivational - moderate happiness with determination
    else if (happiness >= 50 && calmness <= 40) return 'motivational';
    // Calm - high calmness, moderate happiness
    else if (calmness >= 70 && happiness >= 40) return 'calm';
    // Soothing - high calmness, lower happiness
    else if (calmness >= 80 && happiness < 50) return 'soothing';
    // Contemplative - moderate levels, introspective
    else if (happiness >= 40 && happiness <= 60 && calmness >= 50 && calmness <= 70) return 'contemplative';
    // Dreamy - moderate happiness, high calmness
    else if (happiness >= 45 && happiness <= 65 && calmness >= 75) return 'dreamy';
    // Gentle - lower happiness but not sad, higher calmness
    else if (happiness >= 35 && happiness <= 50 && calmness >= 60) return 'gentle';
    // Melancholic - low happiness, moderate calmness
    else if (happiness < 40 && calmness >= 50 && calmness <= 70) return 'melancholic';
    // Sad - low happiness, moderate to high calmness
    else if (happiness < 40 && calmness >= 40) return 'sad';
    // Anxious - low happiness, low calmness
    else if (happiness < 45 && calmness < 40) return 'anxious';
    // Mysterious - lower happiness, lower calmness but not anxious
    else if (happiness < 50 && calmness >= 30 && calmness < 50) return 'mysterious';
    // Spiritual - transcendent feelings
    else if (happiness >= 45 && happiness <= 70 && calmness >= 80) return 'spiritual';
    // Dramatic - intense emotions
    else if ((happiness <= 30 || happiness >= 80) && calmness <= 50) return 'dramatic';
    // Romantic - moderate to high happiness, moderate calmness
    else if (happiness >= 55 && happiness <= 75 && calmness >= 45 && calmness <= 65) return 'romantic';
    // Nostalgic - moderate happiness with reflection
    else if (happiness >= 45 && happiness <= 65 && calmness >= 55 && calmness <= 75) return 'nostalgic';
    // Default fallback
    else return 'peaceful';
  };

  const currentMoodType = getCurrentMoodType();
  
  const { data: recommendations, isLoading } = useQuery<MusicRecommendation[]>({
    queryKey: [`/api/music/recommendations`, { happiness, calmness, moodType: currentMoodType }],
    queryFn: async () => {
      const response = await fetch(`/api/music/recommendations?happiness=${happiness}&calmness=${calmness}&moodType=${moodType || currentMoodType}`);
      return response.json();
    },
    staleTime: 300000, // 5 minutes
  });

  // Get personalized recommendations status
  const { data: personalizedData, isLoading: isPersonalizedLoading } = useQuery({
    queryKey: [`/api/music/recommendations/personalized`, { happiness, calmness, moodType: currentMoodType }],
    queryFn: async () => {
      const response = await fetch(`/api/music/recommendations/personalized?happiness=${happiness}&calmness=${calmness}&moodType=${moodType || currentMoodType}`);
      return response.json();
    },
    staleTime: 300000,
  });

  // Count similar listeners
  const getSimilarListenersCount = () => {
    // Simulate count based on mood ranges
    if (happiness < 40 && calmness < 40) return Math.floor(Math.random() * 15) + 8; // anxious: 8-22
    if (happiness < 40) return Math.floor(Math.random() * 12) + 6; // sad: 6-17
    if (calmness > 70) return Math.floor(Math.random() * 20) + 10; // calm: 10-29
    return Math.floor(Math.random() * 18) + 5; // general: 5-22
  };

  const getMoodDescription = () => {
    const moodType = currentMoodType;
    
    switch (moodType) {
      case 'euphoric': return '也感受著極度欣快';
      case 'empowering': return '也想要感受力量與自信';
      case 'peaceful': return '也在尋找內心平靜';
      case 'hopeful': return '也對未來抱有希望';
      case 'energetic': return '也想要充滿活力';
      case 'excited': return '也感到興奮難耐';
      case 'playful': return '也想要輕鬆玩樂';
      case 'happy': return '也想感受快樂能量';
      case 'motivational': return '也需要勵志的力量';
      case 'calm': return '也在尋找平靜的空間';
      case 'soothing': return '也需要溫柔的撫慰';
      case 'contemplative': return '也在深思人生';
      case 'dreamy': return '也沉浸在夢幻中';
      case 'gentle': return '也需要溫柔的陪伴';
      case 'melancholic': return '也感到淡淡的憂鬱';
      case 'sad': return '也感到有些低落';
      case 'anxious': return '也感到焦慮不安';
      case 'mysterious': return '也感受著神秘氣息';
      case 'spiritual': return '也在尋找靈性寄託';
      case 'dramatic': return '也經歷著強烈情緒';
      case 'romantic': return '也沉浸在浪漫情感中';
      case 'nostalgic': return '也在回憶美好時光';
      default: return '也在尋找情緒共鳴';
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Music className="w-5 h-5 text-primary" />
          療癒音樂
        </h3>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl animate-pulse">
              <div className="w-12 h-12 bg-gray-300 rounded-lg" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-300 rounded w-3/4" />
                <div className="h-3 bg-gray-300 rounded w-1/2" />
              </div>
              <div className="w-8 h-8 bg-gray-300 rounded-full" />
            </div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Music className="w-5 h-5 text-primary" />
          療癒音樂
        </h3>
        <Link href="/music-platforms">
          <Button variant="ghost" size="sm" className="text-xs">
            <Settings className="w-3 h-3 mr-1" />
            個人化設定
          </Button>
        </Link>
      </div>
      
      {/* Personalization Status */}
      {personalizedData && (
        <div className={`mb-4 p-3 rounded-lg border ${
          personalizedData.isPersonalized 
            ? 'bg-green-50 border-green-200' 
            : 'bg-amber-50 border-amber-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {personalizedData.isPersonalized ? (
                <>
                  <Sparkles className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-700 font-medium">
                    智能推薦已啟用
                  </span>
                </>
              ) : (
                <>
                  <Settings className="w-4 h-4 text-amber-600" />
                  <span className="text-sm text-amber-700 font-medium">
                    升級您的音樂體驗
                  </span>
                </>
              )}
            </div>
            {!personalizedData.isPersonalized && (
              <Link href="/music-platforms">
                <Button variant="outline" size="sm" className="text-xs border-amber-300 text-amber-700 hover:bg-amber-100">
                  連接 Spotify
                </Button>
              </Link>
            )}
          </div>
          <p className="text-xs mt-1 text-gray-600">
            {personalizedData.isPersonalized 
              ? personalizedData.message
              : '連接 Spotify 來分析您的音樂喜好，享受真正個人化的療癒推薦'
            }
          </p>
          {personalizedData.userInsight && (
            <div className="mt-2 text-xs text-green-600">
              偏好風格: {personalizedData.userInsight.topGenres?.slice(0, 3).join(', ')} | 
              能量水平: {personalizedData.userInsight.energyLevel}% | 
              正面性: {personalizedData.userInsight.valence}%
            </div>
          )}
        </div>
      )}
      
      {recommendations && recommendations.length > 0 && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700">
            <span className="font-medium">{getSimilarListenersCount()} 人</span>
            {getMoodDescription()}，正在聆聽這些音樂
          </p>
        </div>
      )}
      
      {!recommendations || recommendations.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-6xl mb-4">🎵</div>
          <p className="text-gray-600 mb-2">正在為您準備療癒音樂...</p>
          <p className="text-sm text-gray-500">每一首歌都是為了陪伴您此刻的心情</p>
        </div>
      ) : (
        <div className="space-y-4">
          {(personalizedData?.recommendations || recommendations).map((song) => {
            const isPersonalized = personalizedData?.isPersonalized && personalizedData.recommendations;
            const confidence = (song as any).confidence;
            const reason = (song as any).reason;
            const spotifyMatch = (song as any).spotifyMatch;
            
            return (
              <div key={song.id} className={`flex items-center space-x-4 p-4 rounded-xl hover:shadow-md transition-all duration-300 ${
                isPersonalized 
                  ? 'bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100' 
                  : 'bg-gradient-to-r from-purple-50 to-pink-50'
              }`}>
                <div className="w-12 h-12 bg-gradient-to-r from-primary to-purple-600 rounded-lg flex items-center justify-center">
                  <Music className="w-6 h-6 text-white" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 text-sm">{song.title}</h4>
                  <p className="text-xs text-gray-600 mb-1">{song.artist}</p>
                  {song.genre && (
                    <span className="inline-block px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">
                      {song.genre}
                    </span>
                  )}
                  {reason && (
                    <p className="text-xs text-green-600 mt-1">{reason}</p>
                  )}
                </div>
                
                <div className="flex flex-col space-y-1">
                  {song.youtubeUrl && (
                  <Button
                    size="sm"
                    onClick={() => {
                      try {
                        window.open(song.youtubeUrl!, '_blank');
                      } catch (error) {
                        console.error('Failed to open YouTube link:', error);
                        // Fallback to search if direct link fails
                        const searchQuery = encodeURIComponent(`${song.title} ${song.artist}`);
                        window.open(`https://www.youtube.com/results?search_query=${searchQuery}`, '_blank');
                      }
                    }}
                    className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 text-xs rounded-md transition-colors flex items-center"
                  >
                    <Play className="w-3 h-3 mr-1" />
                    YouTube
                  </Button>
                )}
                {song.spotifyUrl && (
                  <Button
                    size="sm"
                    onClick={() => {
                      try {
                        window.open(song.spotifyUrl!, '_blank');
                      } catch (error) {
                        console.error('Failed to open Spotify link:', error);
                        // Fallback to search if direct link fails
                        const searchQuery = encodeURIComponent(`${song.title} ${song.artist}`);
                        window.open(`https://open.spotify.com/search/${searchQuery}`, '_blank');
                      }
                    }}
                    className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 text-xs rounded-md transition-colors flex items-center"
                  >
                    <Play className="w-3 h-3 mr-1" />
                    Spotify
                  </Button>
                )}
                {!song.youtubeUrl && !song.spotifyUrl && (
                  <Button
                    size="sm"
                    onClick={() => {
                      const searchQuery = encodeURIComponent(`${song.title} ${song.artist}`);
                      window.open(`https://www.youtube.com/results?search_query=${searchQuery}`, '_blank');
                    }}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-2 py-1 text-xs rounded-md transition-colors flex items-center"
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    搜尋
                  </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}