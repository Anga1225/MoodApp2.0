import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';

export default function WelcomePage() {
  const [, setLocation] = useLocation();
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowContent(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleEnter = () => {
    setLocation('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 flex items-center justify-center p-6 overflow-hidden">
      {/* Gentle Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-200/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-200/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-pink-200/10 rounded-full blur-3xl animate-pulse delay-2000 transform -translate-x-1/2 -translate-y-1/2"></div>
      </div>

      <div className="max-w-xl w-full relative z-10">
        {/* Logo and Title */}
        <div className={`text-center mb-16 transition-all duration-1000 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h1 className="text-5xl font-light text-gray-800 mb-4 tracking-wide">MoodTune</h1>
        </div>

        {/* Philosophy */}
        <div className={`text-center space-y-8 mb-16 transition-all duration-1500 delay-300 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="space-y-6 text-gray-700 leading-relaxed">
            <p className="text-lg">這裡沒有排行榜，沒有追蹤者，</p>
            <p className="text-lg">沒有人會知道你今天哭了，也沒有人會問你為什麼笑。</p>
            
            <div className="my-12">
              <div className="w-24 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent mx-auto"></div>
            </div>
            
            <p className="text-xl font-medium text-gray-800">這裡，只有你和音樂。</p>
            <p className="text-lg text-gray-600">和一點點，讓你放鬆的顏色與聲音。</p>
          </div>
        </div>

        {/* Entry Options */}
        <div className={`space-y-6 transition-all duration-1500 delay-600 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <p className="text-center text-lg text-gray-600 mb-8">深吸一口氣。你在一個安全的空間。</p>
          
          <div className="space-y-4">
            <button 
              onClick={handleEnter}
              className="w-full p-6 rounded-2xl bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-150 border border-green-200/50 transition-all duration-300 text-center group hover:shadow-lg"
            >
              <div className="text-2xl mb-3 group-hover:scale-110 transition-transform">🌱</div>
              <div className="text-base font-medium text-gray-800">我現在感覺如何？</div>
            </button>
            
            <button 
              onClick={handleEnter}
              className="w-full p-6 rounded-2xl bg-gradient-to-r from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-150 border border-purple-200/50 transition-all duration-300 text-center group hover:shadow-lg"
            >
              <div className="text-2xl mb-3 group-hover:scale-110 transition-transform">🤗</div>
              <div className="text-base font-medium text-gray-800">我需要一些慰藉</div>
            </button>
            
            <button 
              onClick={handleEnter}
              className="w-full p-6 rounded-2xl bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-150 border border-blue-200/50 transition-all duration-300 text-center group hover:shadow-lg"
            >
              <div className="text-2xl mb-3 group-hover:scale-110 transition-transform">🎵</div>
              <div className="text-base font-medium text-gray-800">只想安靜聽聽</div>
            </button>
          </div>

          <div className="pt-8">
            <Button
              onClick={handleEnter}
              className="w-full py-4 bg-gradient-to-r from-gray-600 to-purple-600 hover:from-gray-700 hover:to-purple-700 text-white font-medium rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl text-lg"
            >
              進入療癒空間
            </Button>
          </div>
        </div>

        {/* Breathing Animation */}
        <div className={`mt-12 flex justify-center transition-all duration-2000 delay-1000 ${showContent ? 'opacity-100' : 'opacity-0'}`}>
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-300"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-700"></div>
          </div>
        </div>
      </div>
    </div>
  );
}