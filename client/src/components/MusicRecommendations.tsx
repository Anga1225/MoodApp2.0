import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { Play, ExternalLink, Music } from 'lucide-react';
import type { MusicRecommendation } from '@shared/schema';

interface MusicRecommendationsProps {
  happiness?: number;
  calmness?: number;
  moodType?: string;
}

export function MusicRecommendations({ happiness = 50, calmness = 50, moodType }: MusicRecommendationsProps) {
  const { data: recommendations, isLoading } = useQuery<MusicRecommendation[]>({
    queryKey: [`/api/music/recommendations?happiness=${happiness}&calmness=${calmness}`],
    staleTime: 300000, // 5 minutes
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
    if (happiness < 40 && calmness < 40) return "也感到焦慮不安";
    if (happiness < 40) return "也感到有些低落";
    if (calmness > 70) return "也在尋找內心平靜";
    if (happiness > 70) return "也想感受快樂能量";
    return "也在尋找情緒共鳴";
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
      <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <Music className="w-5 h-5 text-primary" />
        療癒音樂
      </h3>
      
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
          {recommendations.map((song) => (
            <div key={song.id} className="flex items-center space-x-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl hover:shadow-md transition-all duration-300">
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
          ))}
        </div>
      )}
    </Card>
  );
}