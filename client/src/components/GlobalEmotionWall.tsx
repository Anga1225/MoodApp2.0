import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Heart, Globe, MessageCircle, Users, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { MoodEntry, EmotionMessage } from '@shared/schema';

export function HealingSpace() {
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
        title: "溫暖已傳送 ✨",
        description: "您的關懷已悄悄送達需要的人身邊",
      });
    },
    onError: () => {
      toast({
        title: "稍後再試",
        description: "現在網路有點不穩定，請稍後再分享您的溫暖",
        variant: "destructive",
      });
    }
  });

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      createMessageMutation.mutate(newMessage.trim());
    }
  };

  // Count people with similar emotions
  const getEmotionCount = (targetEmotion: string) => {
    if (!globalEmotions) return 0;
    return globalEmotions.filter(emotion => 
      emotion.quickMood === targetEmotion || 
      (targetEmotion === 'anxious' && emotion.calmness < 40) ||
      (targetEmotion === 'sad' && emotion.happiness < 40) ||
      (targetEmotion === 'peaceful' && emotion.calmness > 70)
    ).length;
  };
  return (
    <div className="space-y-8">
      {/* Gentle Connection Display */}
      <Card className="bg-gradient-to-br from-blue-50/50 to-purple-50/50 rounded-2xl shadow-sm border-0 p-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-blue-400" />
          此刻的共鳴
          <span className="text-sm font-normal text-gray-500 ml-2">你並不孤單</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="p-4 bg-white/60 rounded-xl text-center">
            <div className="text-2xl font-semibold text-blue-600 mb-1">
              {getEmotionCount('anxious')}
            </div>
            <p className="text-sm text-gray-600">人也感到焦慮，正在深呼吸</p>
          </div>
          <div className="p-4 bg-white/60 rounded-xl text-center">
            <div className="text-2xl font-semibold text-purple-600 mb-1">
              {getEmotionCount('sad')}
            </div>
            <p className="text-sm text-gray-600">人也感到低落，正在尋找溫暖</p>
          </div>
          <div className="p-4 bg-white/60 rounded-xl text-center">
            <div className="text-2xl font-semibold text-green-600 mb-1">
              {getEmotionCount('peaceful')}
            </div>
            <p className="text-sm text-gray-600">人正感受著內心的平靜</p>
          </div>
          <div className="p-4 bg-white/60 rounded-xl text-center">
            <div className="text-2xl font-semibold text-orange-600 mb-1">
              {globalEmotions?.length || 0}
            </div>
            <p className="text-sm text-gray-600">人在此刻與你同在</p>
          </div>
        </div>
        
        <div className="text-center p-4 bg-white/40 rounded-xl">
          <p className="text-sm text-gray-700 italic">
            "無論你現在感受如何，都有人理解你的心情。你的感受是真實且重要的。"
          </p>
        </div>
      </Card>

      {/* Gentle Support Messages */}
      <Card className="bg-gradient-to-br from-pink-50/50 to-orange-50/50 rounded-2xl shadow-sm border-0 p-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-primary" />
          溫暖留言
          <span className="text-sm font-normal text-gray-500 ml-2">匿名的關懷</span>
        </h3>
        
        {/* Send Message */}
        <div className="mb-6 p-4 bg-white/60 rounded-xl">
          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="想要在今天送出一點溫暖嗎？"
            className="mb-3 border-none bg-white/80 resize-none"
            maxLength={200}
            rows={3}
          />
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">{newMessage.length}/200</span>
            <Button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || createMessageMutation.isPending}
              className="bg-gradient-to-r from-pink-400 to-orange-400 hover:from-pink-500 hover:to-orange-500 text-white px-4 py-2 text-sm rounded-lg"
            >
              {createMessageMutation.isPending ? '傳送中...' : '悄悄送出'}
            </Button>
          </div>
        </div>

        {/* Messages List */}
        {messagesLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-4 bg-white/40 rounded-xl animate-pulse">
                <div className="h-4 bg-gray-300 rounded w-full mb-2" />
                <div className="flex justify-between">
                  <div className="h-3 bg-gray-300 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : !emotionMessages || emotionMessages.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-2">這裡還很安靜</p>
            <p className="text-sm text-gray-500">也許你可以留下第一句溫暖的話</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-64 overflow-y-auto">
            {emotionMessages.map((message) => (
              <div key={message.id} className="p-4 bg-white/60 rounded-xl border-l-4 border-pink-200">
                <p className="text-gray-800 mb-2 leading-relaxed">"{message.message}"</p>
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span className="text-xs text-gray-500">
                    來自 {message.city || '遠方'} 的溫暖
                  </span>
                  <span className="flex items-center space-x-1 text-pink-400">
                    <Heart className="w-3 h-3 fill-current" />
                    <span>{message.supportCount} 份溫暖</span>
                  </span>
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
export function CommunityWarmth() {
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
      <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
        <Users className="w-5 h-5 text-primary" />
        社群溫度
      </h3>
      
      <div className="grid grid-cols-2 gap-6">
        <div className="text-center p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl">
          <div className="text-3xl font-bold text-blue-600 mb-2">{totalConnections}</div>
          <div className="text-sm text-gray-600">連結數</div>
          <div className="text-xs text-gray-500 mt-1">心情共鳴</div>
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
          <span className="text-sm text-gray-700">
            每一個分享都是溫暖的連結
          </span>
          <Heart className="w-5 h-5 text-red-500" />
        </div>
      </div>
    </Card>
  );
}