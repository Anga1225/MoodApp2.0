import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { Play, ExternalLink, Music } from 'lucide-react';
import type { MusicRecommendation } from '@shared/schema';

interface MusicRecommendationsProps {
  moodType: string;
}

export function MusicRecommendations({ moodType }: MusicRecommendationsProps) {
  const { data: recommendations, isLoading } = useQuery<MusicRecommendation[]>({
    queryKey: [`/api/music/recommendations?moodType=${moodType}`],
    staleTime: 300000, // 5 minutes
  });

  if (isLoading) {
    return (
      <Card className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Music className="w-5 h-5 text-primary" />
          音樂回音
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
        音樂回音
        <span className="text-sm font-normal text-gray-500 ml-2">發現相似心情的音樂</span>
      </h3>
      
      {!recommendations || recommendations.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-6xl mb-4">🎵</div>
          <p className="text-gray-600 mb-2">暫無音樂推薦</p>
          <p className="text-sm text-gray-500">根據您的心情，我們會推薦合適的音樂</p>
        </div>
      ) : (
        <div className="space-y-4">
          {recommendations.map((song) => (
            <div key={song.id} className="flex items-center space-x-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl hover:from-purple-100 hover:to-pink-100 transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-r from-primary to-purple-600 rounded-lg flex items-center justify-center">
                <Music className="w-6 h-6 text-white" />
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900 truncate">{song.title}</h4>
                <p className="text-sm text-gray-600 truncate">{song.artist}</p>
                {song.genre && (
                  <span className="inline-block px-2 py-1 bg-primary/10 text-primary text-xs rounded-full mt-1">
                    {song.genre}
                  </span>
                )}
              </div>
              
              <div className="flex space-x-2">
                {song.spotifyUrl && (
                  <Button
                    size="sm"
                    onClick={() => window.open(song.spotifyUrl!, '_blank')}
                    className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 text-xs rounded-lg"
                  >
                    <Play className="w-3 h-3 mr-1" />
                    Spotify
                  </Button>
                )}
                {song.youtubeUrl && (
                  <Button
                    size="sm"
                    onClick={() => window.open(song.youtubeUrl!, '_blank')}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 text-xs rounded-lg"
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    YouTube
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