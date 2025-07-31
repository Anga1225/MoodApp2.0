import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useLocation } from 'wouter';

export default function WelcomePage() {
  const [, setLocation] = useLocation();
  const [showPhilosophy, setShowPhilosophy] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowPhilosophy(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleEnter = () => {
    setLocation('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-50 via-lavender-50 to-beige-50 flex items-center justify-center p-4 overflow-hidden">
      {/* Gentle Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-sage-200/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-lavender-200/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-dusty-rose-200/20 rounded-full blur-3xl animate-pulse delay-2000 transform -translate-x-1/2 -translate-y-1/2"></div>
      </div>

      <Card className="max-w-2xl w-full bg-white/80 backdrop-blur-lg border-none shadow-2xl rounded-3xl p-12 text-center relative z-10">
        {/* Logo and Title */}
        <div className="mb-8">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-sage-400 to-lavender-400 flex items-center justify-center">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={1.5} 
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">MoodTune</h1>
          <p className="text-gray-500 text-lg">專屬的療癒空間</p>
        </div>

        {/* Philosophy Text */}
        <div className={`transition-all duration-2000 ${showPhilosophy ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="space-y-6 mb-12">
            <div className="text-gray-700 leading-relaxed space-y-4">
              <p className="text-lg font-medium text-gray-800">
                這裡沒有排行榜，沒有追蹤者，
              </p>
              <p className="text-lg font-medium text-gray-800">
                沒有人會知道你今天哭了，也沒有人會問你為什麼笑。
              </p>
              
              <div className="my-8">
                <div className="w-16 h-px bg-gradient-to-r from-transparent via-sage-300 to-transparent mx-auto"></div>
              </div>
              
              <p className="text-xl font-semibold text-gray-800 mb-4">
                這裡，只有你和音樂。
              </p>
              <p className="text-lg text-gray-700">
                和一點點，讓你放鬆的顏色與聲音。
              </p>
            </div>
          </div>

          {/* Gentle Entry Options */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-700 mb-6">
              深吸一口氣。你在一個安全的空間。
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <button 
                onClick={handleEnter}
                className="p-6 rounded-2xl bg-gradient-to-br from-sage-100 to-sage-200 hover:from-sage-200 hover:to-sage-300 transition-all duration-300 text-center group"
              >
                <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">🌱</div>
                <div className="text-sm font-medium text-gray-800">我現在感覺如何？</div>
              </button>
              
              <button 
                onClick={handleEnter}
                className="p-6 rounded-2xl bg-gradient-to-br from-lavender-100 to-lavender-200 hover:from-lavender-200 hover:to-lavender-300 transition-all duration-300 text-center group"
              >
                <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">🤗</div>
                <div className="text-sm font-medium text-gray-800">我需要一些慰藉</div>
              </button>
              
              <button 
                onClick={handleEnter}
                className="p-6 rounded-2xl bg-gradient-to-br from-dusty-rose-100 to-dusty-rose-200 hover:from-dusty-rose-200 hover:to-dusty-rose-300 transition-all duration-300 text-center group"
              >
                <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">🎵</div>
                <div className="text-sm font-medium text-gray-800">只想安靜聽聽</div>
              </button>
            </div>

            <Button
              onClick={handleEnter}
              className="w-full md:w-auto px-12 py-4 bg-gradient-to-r from-sage-400 to-lavender-400 hover:from-sage-500 hover:to-lavender-500 text-white font-medium rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              進入療癒空間
            </Button>
          </div>
        </div>

        {/* Breathing Animation Hint */}
        <div className="mt-8 flex justify-center">
          <div className="w-3 h-3 bg-sage-400 rounded-full animate-pulse"></div>
          <div className="w-3 h-3 bg-lavender-400 rounded-full animate-pulse delay-500 ml-2"></div>
          <div className="w-3 h-3 bg-dusty-rose-400 rounded-full animate-pulse delay-1000 ml-2"></div>
        </div>
      </Card>
    </div>
  );
}