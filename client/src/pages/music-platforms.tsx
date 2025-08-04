import { MusicPlatformIntegration } from '@/components/MusicPlatformIntegration';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Music2, Sparkles } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { useMoodTracking } from '@/hooks/useMoodTracking';

export function MusicPlatformsPage() {
  const [, setLocation] = useLocation();
  const { currentMood } = useMoodTracking();

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage/10 via-lavender/5 to-dusty-rose/10">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => setLocation('/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回儀表板
          </Button>
          
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Music2 className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">音樂平台整合</h1>
              <p className="text-muted-foreground">
                連接您的音樂串流服務，享受個人化情緒音樂推薦
              </p>
            </div>
          </div>
        </div>

        {/* Introduction Card */}
        <Card className="mb-8 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <span>個人化音樂療癒體驗</span>
            </CardTitle>
            <CardDescription>
              MoodTune 2.0 將分析您的音樂喜好，結合當前心情狀態，為您推薦最適合的療癒音樂
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-medium text-primary">智能分析功能</h4>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li className="flex items-start space-x-2">
                    <span className="text-primary">•</span>
                    <span>分析您的音樂品味和聆聽習慣</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-primary">•</span>
                    <span>識別您喜愛的藝人和音樂風格</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-primary">•</span>
                    <span>學習您在不同心情下的音樂偏好</span>
                  </li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="font-medium text-primary">個人化推薦</h4>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li className="flex items-start space-x-2">
                    <span className="text-primary">•</span>
                    <span>根據心情狀態推薦合適音樂</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-primary">•</span>
                    <span>結合音樂喜好提升推薦精準度</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-primary">•</span>
                    <span>自動調整推薦以改善情緒狀態</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Music Platform Integration Component */}
        <MusicPlatformIntegration 
          userId="demo-user"
          currentMood={currentMood}
        />

        {/* How It Works */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>運作原理</CardTitle>
            <CardDescription>
              了解 MoodTune 如何為您提供個人化音樂療癒體驗
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-primary font-bold">1</span>
                </div>
                <h4 className="font-medium">連接平台</h4>
                <p className="text-sm text-muted-foreground">
                  安全連接您的 Spotify、Apple Music 或其他音樂平台
                </p>
              </div>
              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-primary font-bold">2</span>
                </div>
                <h4 className="font-medium">分析偏好</h4>
                <p className="text-sm text-muted-foreground">
                  分析您的聆聽歷史、喜愛藝人和音樂風格偏好
                </p>
              </div>
              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-primary font-bold">3</span>
                </div>
                <h4 className="font-medium">智能推薦</h4>
                <p className="text-sm text-muted-foreground">
                  結合心情追蹤與音樂偏好，提供個人化療癒音樂
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Privacy Notice */}
        <Card className="mt-6 border-muted">
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">
              <h4 className="font-medium mb-2">隱私保護</h4>
              <p>
                我們重視您的隱私。音樂平台整合僅用於分析音樂偏好和提供個人化推薦，
                不會儲存或分享您的個人資料。您可以隨時中斷連接。
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}