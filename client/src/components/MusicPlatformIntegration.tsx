import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Music, HeadphonesIcon, TrendingUp } from 'lucide-react';
import { SiSpotify } from 'react-icons/si';
import { useToast } from '@/hooks/use-toast';

interface PlatformStatus {
  connected: boolean;
  authUrl?: string;
  description: string;
  available?: boolean;
}

interface MusicPreferences {
  hasPreferences: boolean;
  analysis: {
    message: string;
    suggestion: string;
    benefits: string[];
  };
  connectOptions: Array<{
    platform: string;
    name: string;
    description: string;
    authUrl: string;
  }>;
}

interface MusicPlatformIntegrationProps {
  userId?: string;
  currentMood?: {
    happiness: number;
    calmness: number;
  };
}

export function MusicPlatformIntegration({ userId, currentMood }: MusicPlatformIntegrationProps) {
  const [platforms, setPlatforms] = useState<Record<string, PlatformStatus>>({});
  const [preferences, setPreferences] = useState<MusicPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadPlatformStatus();
    loadUserPreferences();
  }, [userId]);

  const loadPlatformStatus = async () => {
    try {
      const response = await fetch('/api/music/platforms/status');
      const data = await response.json();
      setPlatforms(data);
    } catch (error) {
      console.error('Failed to load platform status:', error);
    }
  };

  const loadUserPreferences = async () => {
    try {
      const response = await fetch(`/api/music/analytics/preferences?userId=${userId || 'demo'}`);
      const data = await response.json();
      setPreferences(data);
    } catch (error) {
      console.error('Failed to load preferences:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const connectSpotify = async () => {
    try {
      const response = await fetch('/api/music/platforms/auth/spotify');
      const data = await response.json();
      
      if (data.authUrl) {
        // Open in new window for OAuth
        window.open(data.authUrl, 'spotify-auth', 'width=600,height=700');
        
        toast({
          title: "正在連接 Spotify",
          description: "請在新視窗中完成授權登入",
        });
      }
    } catch (error) {
      toast({
        title: "連接失敗",
        description: "無法連接到 Spotify，請稍後再試",
        variant: "destructive",
      });
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'spotify':
        return <SiSpotify className="h-5 w-5 text-green-500" />;
      case 'appleMusic':
        return <Music className="h-5 w-5" />;
      case 'youtubeMusic':
        return <HeadphonesIcon className="h-5 w-5" />;
      default:
        return <Music className="h-5 w-5" />;
    }
  };

  const getPlatformName = (platform: string) => {
    switch (platform) {
      case 'spotify':
        return 'Spotify';
      case 'appleMusic':
        return 'Apple Music';
      case 'youtubeMusic':
        return 'YouTube Music';
      default:
        return platform;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-2">
            <Music className="h-5 w-5 animate-pulse" />
            <span>載入音樂平台設定...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Platform Integration Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Music className="h-5 w-5" />
            <span>音樂平台整合</span>
          </CardTitle>
          <CardDescription>
            連接音樂串流平台來獲得個人化情緒音樂推薦
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(platforms).map(([key, platform]) => (
              <div key={key} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  {getPlatformIcon(key)}
                  <div>
                    <h4 className="font-medium">{getPlatformName(key)}</h4>
                    <p className="text-sm text-muted-foreground">{platform.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {platform.connected ? (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      已連接
                    </Badge>
                  ) : (
                    <>
                      {platform.available !== false ? (
                        <Button
                          onClick={key === 'spotify' ? connectSpotify : undefined}
                          disabled={key !== 'spotify'}
                          size="sm"
                        >
                          連接
                        </Button>
                      ) : (
                        <Badge variant="outline">即將推出</Badge>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Music Preferences Analysis */}
      {preferences && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>音樂偏好分析</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-2">{preferences.analysis?.message}</h4>
                
                {preferences.hasPreferences ? (
                  // Show analysis results when user has preferences
                  <div className="space-y-4">
                    <p className="text-sm text-green-600 font-medium">
                      {preferences.analysis?.insight}
                    </p>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h5 className="text-sm font-medium mb-2">偏好音樂風格：</h5>
                        <div className="flex flex-wrap gap-1">
                          {preferences.analysis?.topGenres?.slice(0, 5).map((genre, index) => (
                            <span key={index} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                              {genre}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h5 className="text-sm font-medium mb-2">常聽藝人：</h5>
                        <div className="text-sm text-muted-foreground">
                          {preferences.analysis?.topArtists?.slice(0, 3).join(', ')}
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 pt-3 border-t">
                      <div className="text-center">
                        <div className="text-lg font-bold text-primary">{preferences.analysis?.energyLevel}%</div>
                        <div className="text-xs text-muted-foreground">能量水平</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-primary">{preferences.analysis?.valence}%</div>
                        <div className="text-xs text-muted-foreground">正面性</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-primary">{preferences.analysis?.totalTracks}</div>
                        <div className="text-xs text-muted-foreground">分析歌曲</div>
                      </div>
                    </div>
                    
                    {preferences.recommendations && (
                      <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                        <p className="text-sm text-green-700 font-medium">
                          ✅ {preferences.recommendations.message}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  // Show connection benefits when user doesn't have preferences
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground mb-3">
                      {preferences.analysis?.suggestion}
                    </p>
                    <div className="space-y-2">
                      <h5 className="text-sm font-medium">連接音樂平台的好處：</h5>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {preferences.analysis?.benefits?.map((benefit, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <span className="text-primary">•</span>
                            <span>{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>

              {preferences.connectOptions?.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">推薦連接：</h4>
                  {preferences.connectOptions?.map((option) => (
                    <Button
                      key={option.platform}
                      onClick={option.platform === 'spotify' ? connectSpotify : undefined}
                      variant="outline"
                      className="justify-start"
                    >
                      <div className="flex items-center space-x-2">
                        {getPlatformIcon(option.platform)}
                        <span>{option.description}</span>
                      </div>
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Mood Integration Info */}
      {currentMood && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">當前心情音樂推薦</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              <p>當前心情：快樂度 {currentMood.happiness}，平靜度 {currentMood.calmness}</p>
              <p className="mt-2">
                連接音樂平台後，我們將根據您的心情變化和音樂喜好，
                提供更精準的個人化推薦。
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}