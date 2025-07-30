import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Heart, Globe, MessageCircle, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { MoodEntry, EmotionMessage } from '@shared/schema';

export function GlobalEmotionWall() {
  const [newMessage, setNewMessage] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: globalEmotions, isLoading: emotionsLoading } = useQuery<MoodEntry[]>({
    queryKey: ['/api/emotions/global'],
    staleTime: 30000, // 30 seconds
  });

  const { data: emotionMessages, isLoading: messagesLoading } = useQuery<EmotionMessage[]>({
    queryKey: ['/api/emotions/messages'],
    staleTime: 30000,
  });

  const createMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await apiRequest('POST', '/api/emotions/messages', {
        message,
        moodEntryId: null,
        isAnonymous: 1
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/emotions/messages'] });
      setNewMessage('');
      toast({
        title: "訊息已發送",
        description: "您的支持訊息已成功發送",
      });
    },
    onError: () => {
      toast({
        title: "發送失敗",
        description: "訊息發送失敗，請重試",
        variant: "destructive",
      });
    }
  });

  const supportMessageMutation = useMutation({
    mutationFn: async (messageId: string) => {
      const response = await apiRequest('POST', `/api/emotions/messages/${messageId}/support`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/emotions/messages'] });
      toast({
        title: "支持已發送",
        description: "您的溫暖已傳送給對方",
      });
    }
  });

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      createMessageMutation.mutate(newMessage.trim());
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Global Emotion Wall */}
      <Card className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Globe className="w-5 h-5 text-primary" />
          全球情緒牆
          <span className="text-sm font-normal text-gray-500 ml-2">實時情緒分享</span>
        </h3>
        
        {emotionsLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl animate-pulse">
                <div className="w-12 h-12 rounded-full bg-gray-300" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-300 rounded w-3/4" />
                  <div className="h-3 bg-gray-300 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : !globalEmotions || globalEmotions.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">🌍</div>
            <p className="text-gray-600 mb-2">暂無全球情緒分享</p>
            <p className="text-sm text-gray-500">成為第一個分享情緒的人</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {globalEmotions.map((emotion) => (
              <div key={emotion.id} className="flex items-start space-x-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
                <div 
                  className="w-12 h-12 rounded-full flex-shrink-0 border-2 border-white shadow-md"
                  style={{ background: `linear-gradient(135deg, ${emotion.colorHex}, ${emotion.colorHex}dd)` }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-sm font-medium text-gray-700">
                      {emotion.quickMood ? emotion.quickMood.charAt(0).toUpperCase() + emotion.quickMood.slice(1) : '自定義心情'}
                    </span>
                    {emotion.city && (
                      <span className="text-xs text-gray-500">
                        📍 {emotion.city}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    快樂度: {emotion.happiness} | 平靜度: {emotion.calmness}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {formatDistanceToNow(new Date(emotion.timestamp), { addSuffix: true })}
                  </p>
                  {emotion.notes && (
                    <p className="text-sm text-gray-600 mt-2 italic">"{emotion.notes}"</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Anonymous Support Messages */}
      <Card className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-primary" />
          匿名留言
          <span className="text-sm font-normal text-gray-500 ml-2">情緒支持訊息</span>
        </h3>
        
        {/* Send Message */}
        <div className="mb-6 p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl">
          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="發送一則溫暖的支持訊息..."
            className="mb-3 border-none bg-white/80"
            maxLength={200}
          />
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">{newMessage.length}/200</span>
            <Button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || createMessageMutation.isPending}
              className="bg-gradient-to-r from-primary to-purple-600 text-white px-4 py-2 text-sm rounded-lg"
            >
              {createMessageMutation.isPending ? '發送中...' : '發送支持'}
            </Button>
          </div>
        </div>

        {/* Messages List */}
        {messagesLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-4 bg-gray-50 rounded-xl animate-pulse">
                <div className="h-4 bg-gray-300 rounded w-full mb-2" />
                <div className="flex justify-between">
                  <div className="h-3 bg-gray-300 rounded w-1/3" />
                  <div className="h-3 bg-gray-300 rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : !emotionMessages || emotionMessages.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">💌</div>
            <p className="text-gray-600 mb-2">暫無支持訊息</p>
            <p className="text-sm text-gray-500">發送第一則支持訊息</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-80 overflow-y-auto">
            {emotionMessages.map((message) => (
              <div key={message.id} className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl">
                <p className="text-gray-800 mb-3">"{message.message}"</p>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
                  </span>
                  <Button
                    size="sm"
                    onClick={() => supportMessageMutation.mutate(message.id)}
                    disabled={supportMessageMutation.isPending}
                    className="flex items-center space-x-1 bg-red-100 hover:bg-red-200 text-red-600 px-3 py-1 text-xs rounded-lg border-0"
                  >
                    <Heart className="w-3 h-3" />
                    <span>{message.supportCount}</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

// Statistics Component
export function EmotionStatistics() {
  const { data: globalEmotions } = useQuery<MoodEntry[]>({
    queryKey: ['/api/emotions/global'],
  });

  const { data: emotionMessages } = useQuery<EmotionMessage[]>({
    queryKey: ['/api/emotions/messages'],
  });

  const totalConnections = globalEmotions?.length || 0;
  const totalSupport = emotionMessages?.reduce((sum, msg) => sum + msg.supportCount, 0) || 0;

  return (
    <Card className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
      <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <Users className="w-5 h-5 text-primary" />
        情緒統計
      </h3>
      
      <div className="grid grid-cols-2 gap-6">
        <div className="text-center p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl">
          <div className="text-3xl font-bold text-blue-600 mb-2">{totalConnections}</div>
          <div className="text-sm text-gray-600">連結數</div>
          <div className="text-xs text-gray-500 mt-1">全球情緒分享</div>
        </div>
        
        <div className="text-center p-4 bg-gradient-to-r from-pink-500/10 to-red-500/10 rounded-xl">
          <div className="text-3xl font-bold text-pink-600 mb-2">{totalSupport}</div>
          <div className="text-sm text-gray-600">溫暖傳送</div>
          <div className="text-xs text-gray-500 mt-1">支持訊息數量</div>
        </div>
      </div>
      
      <div className="mt-6 p-4 bg-gradient-to-r from-green-500/10 to-teal-500/10 rounded-xl">
        <div className="flex items-center justify-center space-x-3">
          <Heart className="w-5 h-5 text-red-500" />
          <span className="text-sm text-gray-700 font-medium">
            每一個分享都是溫暖的連結
          </span>
          <Heart className="w-5 h-5 text-red-500" />
        </div>
      </div>
    </Card>
  );
}