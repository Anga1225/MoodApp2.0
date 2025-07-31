import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Play, Pause, RotateCcw, Heart, Music, ExternalLink } from 'lucide-react';
import { calculateMoodColor } from '@/utils/colorAlgorithms';
import { useQuery } from '@tanstack/react-query';
import type { MusicRecommendation } from '@shared/schema';

interface ColorTherapyPageProps {
  onBack: () => void;
  initialColor?: string;
}

interface TherapySession {
  name: string;
  description: string;
  duration: number; // in seconds
  colors: string[];
  instructions: string[];
  musicType: string; // for music recommendations
}

const THERAPY_SESSIONS: TherapySession[] = [
  {
    name: '平靜藍調',
    description: '緩解焦慮，帶來內心平靜',
    duration: 300, // 5 minutes
    colors: ['#4A90E2', '#5BA3F2', '#6CB6FF', '#7DC9FF', '#8EDCFF'],
    musicType: 'calm',
    instructions: [
      '深呼吸，讓自己放鬆',
      '專注於藍色的平靜能量',
      '想像自己在寧靜的海邊',
      '感受內心的平和與安寧',
      '繼續深呼吸，放下所有煩惱'
    ]
  },
  {
    name: '活力橙光',
    description: '提升能量，激發創造力',
    duration: 240, // 4 minutes
    colors: ['#FF6B35', '#FF7F50', '#FF8C69', '#FFA07A', '#FFB347'],
    musicType: 'energetic',
    instructions: [
      '感受橙色的溫暖與活力',
      '讓這份能量充滿全身',
      '想像陽光灑在身上的感覺',
      '激發內在的創造力',
      '感受生命的熱情與動力'
    ]
  },
  {
    name: '療癒綠意',
    description: '平衡情緒，促進內在和諧',
    duration: 360, // 6 minutes
    colors: ['#50C878', '#66CDAA', '#7FFFD4', '#90EE90', '#98FB98'],
    musicType: 'peaceful',
    instructions: [
      '讓綠色的療癒能量環繞你',
      '感受大自然的生命力',
      '釋放內心的負面情緒',
      '尋找內在的平衡點',
      '感受身心的和諧統一'
    ]
  },
  {
    name: '溫暖紫羅蘭',
    description: '提升靈性，增強直覺',
    duration: 420, // 7 minutes
    colors: ['#8A2BE2', '#9370DB', '#BA55D3', '#DA70D6', '#DDA0DD'],
    musicType: 'sad',
    instructions: [
      '沉浸在紫色的神秘能量中',
      '打開心靈的智慧之門',
      '信任你內在的直覺',
      '連接更高層次的意識',
      '感受靈性的覺醒與成長'
    ]
  }
];

export function ColorTherapyPage({ onBack, initialColor }: ColorTherapyPageProps) {
  const [selectedSession, setSelectedSession] = useState<TherapySession | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [currentColorIndex, setCurrentColorIndex] = useState(0);
  const [breathingPhase, setBreathingPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');

  // Fetch music recommendations for the selected session
  const { data: sessionMusic } = useQuery<MusicRecommendation[]>({
    queryKey: [`/api/music/recommendations`, selectedSession?.musicType],
    enabled: !!selectedSession,
    queryFn: async () => {
      const response = await fetch(`/api/music/recommendations?moodType=${selectedSession?.musicType}`);
      return response.json();
    },
    staleTime: 300000, // 5 minutes
  });

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isActive && selectedSession) {
      interval = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= selectedSession.duration) {
            setIsActive(false);
            return selectedSession.duration;
          }
          return prev + 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isActive, selectedSession]);

  useEffect(() => {
    if (isActive && selectedSession) {
      const colorInterval = setInterval(() => {
        setCurrentColorIndex(prev => (prev + 1) % selectedSession.colors.length);
      }, 8000); // Change color every 8 seconds

      return () => clearInterval(colorInterval);
    }
  }, [isActive, selectedSession]);

  useEffect(() => {
    if (isActive) {
      const breathingInterval = setInterval(() => {
        setBreathingPhase(prev => {
          switch (prev) {
            case 'inhale': return 'hold';
            case 'hold': return 'exhale';
            case 'exhale': return 'inhale';
            default: return 'inhale';
          }
        });
      }, 4000); // 4 second breathing cycle

      return () => clearInterval(breathingInterval);
    }
  }, [isActive]);

  const startSession = (session: TherapySession) => {
    setSelectedSession(session);
    setCurrentTime(0);
    setCurrentColorIndex(0);
    setIsActive(true);
  };

  const pauseSession = () => {
    setIsActive(!isActive);
  };

  const resetSession = () => {
    setIsActive(false);
    setCurrentTime(0);
    setCurrentColorIndex(0);
  };

  const endSession = () => {
    setSelectedSession(null);
    setIsActive(false);
    setCurrentTime(0);
    setCurrentColorIndex(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getBreathingInstruction = () => {
    switch (breathingPhase) {
      case 'inhale': return '深深吸氣...';
      case 'hold': return '屏住呼吸...';
      case 'exhale': return '慢慢呼氣...';
    }
  };

  const getCurrentInstruction = () => {
    if (!selectedSession) return '';
    const progress = currentTime / selectedSession.duration;
    const instructionIndex = Math.floor(progress * selectedSession.instructions.length);
    return selectedSession.instructions[Math.min(instructionIndex, selectedSession.instructions.length - 1)];
  };

  if (selectedSession) {
    const currentColor = selectedSession.colors[currentColorIndex];
    const progress = (currentTime / selectedSession.duration) * 100;
    const isCompleted = currentTime >= selectedSession.duration;

    return (
      <div 
        className="min-h-screen flex items-center justify-center transition-all duration-2000"
        style={{ background: `linear-gradient(135deg, ${currentColor}20, ${currentColor}40, ${currentColor}60)` }}
      >
        <div className="container mx-auto px-4 max-w-2xl">
          <Card className="bg-white/90 backdrop-blur-sm p-8 text-center">
            <div className="flex items-center justify-between mb-6">
              <Button variant="ghost" onClick={endSession} className="p-2">
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h2 className="text-2xl font-bold text-gray-900">{selectedSession.name}</h2>
              <div className="w-10" /> {/* Spacer */}
            </div>

            {/* Color Display */}
            <div className="relative mb-8">
              <div 
                className={`w-48 h-48 mx-auto rounded-full shadow-2xl transition-all duration-2000 ${
                  isActive ? 'animate-pulse' : ''
                }`}
                style={{ 
                  background: `radial-gradient(circle, ${currentColor}, ${currentColor}cc, ${currentColor}99)`,
                  transform: isActive ? 'scale(1.05)' : 'scale(1)',
                }}
              />
              {isActive && (
                <div 
                  className="absolute inset-0 rounded-full bg-white/30 animate-ping mx-auto w-48 h-48"
                  style={{ 
                    animationDuration: breathingPhase === 'hold' ? '1s' : '4s',
                    animationIterationCount: 'infinite'
                  }}
                />
              )}
            </div>

            {/* Progress */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-600">進度</span>
                <span className="text-sm font-bold text-gray-900">
                  {formatTime(currentTime)} / {formatTime(selectedSession.duration)}
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            {/* Instructions */}
            <div className="mb-8 space-y-4">
              {isActive && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-lg font-medium text-primary mb-2">
                    {getBreathingInstruction()}
                  </p>
                  <p className="text-sm text-gray-600">
                    {getCurrentInstruction()}
                  </p>
                </div>
              )}

              {/* Session Music */}
              {sessionMusic && sessionMusic.length > 0 && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <Music className="w-4 h-4" />
                    推薦療癒音樂
                  </h4>
                  <div className="space-y-2">
                    {sessionMusic.slice(0, 3).map((song) => (
                      <div key={song.id} className="flex items-center justify-between p-2 bg-white rounded-lg">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-gray-900 truncate">{song.title}</p>
                          <p className="text-xs text-gray-600">{song.artist}</p>
                        </div>
                        <div className="flex gap-1">
                          {song.youtubeUrl && (
                            <Button
                              size="sm"
                              onClick={() => window.open(song.youtubeUrl!, '_blank')}
                              className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 text-xs rounded"
                            >
                              <Play className="w-3 h-3" />
                            </Button>
                          )}
                          {song.spotifyUrl && (
                            <Button
                              size="sm"
                              onClick={() => window.open(song.spotifyUrl!, '_blank')}
                              className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 text-xs rounded"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="flex justify-center gap-4">
              {!isCompleted ? (
                <>
                  <Button
                    onClick={pauseSession}
                    variant="outline"
                    size="lg"
                    className="flex items-center gap-2"
                  >
                    {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    {isActive ? '暫停' : '繼續'}
                  </Button>
                  <Button
                    onClick={resetSession}
                    variant="outline"
                    size="lg"
                    className="flex items-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    重新開始
                  </Button>
                </>
              ) : (
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <Heart className="w-6 h-6 text-red-500" />
                    <span className="text-lg font-bold text-gray-900">療程完成！</span>
                  </div>
                  <Button onClick={endSession} size="lg">
                    返回選擇
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 overflow-hidden">
      {/* Mountain Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-600/20 to-slate-900/40"></div>
      <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-slate-900 via-slate-800/60 to-transparent"></div>
      
      <div className="relative z-10 container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            onClick={onBack}
            className="p-2 hover:bg-white/10 rounded-full text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-white">色彩療法</h1>
            <p className="text-slate-300 mt-1">透過色彩冥想，平衡身心靈</p>
          </div>
        </div>

        {/* Initial Color Display (if provided) */}
        {initialColor && (
          <Card className="p-6 mb-8 bg-slate-800/30 border-slate-600 backdrop-blur-sm">
            <h3 className="text-xl font-bold text-white mb-4">您當前的心情色彩</h3>
            <div className="flex items-center gap-6">
              <div 
                className="w-24 h-24 rounded-full shadow-lg"
                style={{ background: initialColor }}
              />
              <div>
                <p className="text-slate-300 mb-2">
                  這是根據您當前心情生成的專屬色彩
                </p>
                <p className="text-sm text-slate-400">
                  選擇下方的療程來進一步調節和平衡您的情緒狀態
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Therapy Sessions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {THERAPY_SESSIONS.map((session, index) => {
            const gradientColors = [
              'from-blue-400 via-blue-500 to-blue-600',
              'from-orange-400 via-orange-500 to-orange-600',
              'from-emerald-400 via-emerald-500 to-emerald-600',
              'from-purple-400 via-purple-500 to-purple-600'
            ];
            return (
              <div key={index} className="group">
                <div 
                  className={`relative h-64 rounded-3xl bg-gradient-to-br ${gradientColors[index]} p-6 transition-transform hover:scale-105 cursor-pointer shadow-lg`} 
                  onClick={() => startSession(session)}
                >
                  <div className="absolute top-4 left-4 text-white/80 text-sm font-medium">
                    {session.name}
                  </div>
                  <div className="absolute top-4 right-4 text-white/60 text-xs">
                    {Math.floor(session.duration / 60)} 分鐘
                  </div>
                  
                  <div className="absolute bottom-20 left-4">
                    <p className="text-white/90 text-sm mb-4">{session.description}</p>
                    <div className="flex gap-2">
                      {session.colors.slice(0, 3).map((color, colorIndex) => (
                        <div
                          key={colorIndex}
                          className="w-6 h-6 rounded-full shadow-sm"
                          style={{ background: color }}
                        />
                      ))}
                    </div>
                  </div>
                  
                  <div className="absolute bottom-4 left-4 right-4">
                    <Button
                      className="w-full bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm"
                      variant="outline"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      開始療程
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Info Section */}
        <Card className="p-6 mt-8 bg-slate-800/30 border-slate-600 backdrop-blur-sm">
          <h3 className="text-xl font-bold text-white mb-4">什麼是色彩療法？</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-white mb-2">療法原理</h4>
              <p className="text-sm text-slate-300 mb-4">
                色彩療法是一種利用不同顏色的振動頻率來影響身心狀態的自然療法。
                每種顏色都有其獨特的能量和治療特性，能夠幫助調節情緒、平衡能量。
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-2">使用建議</h4>
              <ul className="text-sm text-slate-300 space-y-1">
                <li>• 在安靜的環境中進行療程</li>
                <li>• 保持舒適的坐姿或躺姿</li>
                <li>• 專注於呼吸和色彩冥想</li>
                <li>• 每日進行10-15分鐘效果最佳</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}