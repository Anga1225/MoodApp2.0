import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { apiRequest } from '@/lib/queryClient';
import type { MoodTwin } from '@shared/schema';

interface MoodTwinsProps {
  happiness: number;
  calmness: number;
}

export default function MoodTwins({ happiness, calmness }: MoodTwinsProps) {
  const [selectedMusic, setSelectedMusic] = useState<string>('');
  const queryClient = useQueryClient();

  const { data: twins, isLoading } = useQuery<MoodTwin[]>({
    queryKey: ['/api/mood/twins', happiness, calmness],
    enabled: happiness > 0 || calmness > 0,
  });

  const sendWarmthMutation = useMutation({
    mutationFn: async (data: { musicType: string; message: string }) => 
      apiRequest('/api/mood/twins/send-warmth', 'POST', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/mood/twins'] });
    },
  });

  const musicOptions = [
    'lo-fi 雨聲',
    '古典鋼琴',
    '自然白噪音',
    '溫柔爵士',
    '冥想音樂',
    '輕柔民謠'
  ];

  const getCurrentTwin = () => {
    if (!twins || twins.length === 0) return null;
    // 根據當前心情找到最匹配的雙胞胎
    const currentMoodType = happiness > 60 ? 
      (calmness > 60 ? 'lo-fi 雨聲' : '輕柔民謠') : 
      (calmness > 60 ? '古典鋼琴' : '冥想音樂');
    
    return twins.find(twin => twin.musicType === currentMoodType) || twins[0];
  };

  const handleSendWarmth = async () => {
    if (!selectedMusic) return;
    
    try {
      await sendWarmthMutation.mutateAsync({
        musicType: selectedMusic,
        message: `有人感受到你了，這是他送你的歌`
      });
      setSelectedMusic('');
    } catch (error) {
      console.error('Failed to send warmth:', error);
    }
  };

  const currentTwin = getCurrentTwin();

  return (
    <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-100">
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-800 mb-2">心情雙胞胎</h3>
          
          {isLoading ? (
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto"></div>
            </div>
          ) : currentTwin ? (
            <div className="space-y-2">
              <p className="text-base text-gray-700">
                今天你和 <span className="font-semibold text-purple-600">{currentTwin.twinCount.toLocaleString()}</span> 個人一樣
              </p>
              <p className="text-base text-gray-700">
                在聽 <span className="font-medium">{currentTwin.musicType}</span>
              </p>
              {currentTwin.city && (
                <p className="text-sm text-gray-500">
                  來自 {currentTwin.city} 的溫暖
                </p>
              )}
            </div>
          ) : (
            <p className="text-gray-500">暫時沒有找到心情相似的人</p>
          )}
        </div>

        {/* 送出匿名溫暖 */}
        <div className="border-t border-purple-100 pt-4">
          <p className="text-sm text-gray-600 mb-3 text-center">送一首歌給心情相似的人</p>
          
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              {musicOptions.map((music) => (
                <button
                  key={music}
                  onClick={() => setSelectedMusic(music)}
                  className={`p-2 rounded-lg text-sm transition-colors ${
                    selectedMusic === music
                      ? 'bg-purple-100 text-purple-700 border border-purple-200'
                      : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {music}
                </button>
              ))}
            </div>

            <Button
              onClick={handleSendWarmth}
              disabled={!selectedMusic || sendWarmthMutation.isPending}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
            >
              {sendWarmthMutation.isPending ? '送出中...' : '送出匿名溫暖'}
            </Button>
          </div>
        </div>

        {/* 收到的溫暖 */}
        <div className="bg-white/50 rounded-lg p-3">
          <p className="text-xs text-gray-500 text-center">
            當有人送你音樂時，你會在這裡收到通知
          </p>
        </div>
      </div>
    </Card>
  );
}