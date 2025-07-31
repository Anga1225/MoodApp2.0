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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900 flex items-center justify-center p-6 overflow-hidden relative">
      {/* Starry background effect */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-20 w-1 h-1 bg-white/40 rounded-full animate-pulse"></div>
        <div className="absolute top-32 right-32 w-1 h-1 bg-white/30 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/4 w-0.5 h-0.5 bg-white/50 rounded-full animate-pulse delay-2000"></div>
        <div className="absolute top-1/3 right-1/4 w-0.5 h-0.5 bg-white/40 rounded-full animate-pulse delay-500"></div>
        <div className="absolute bottom-1/3 right-20 w-1 h-1 bg-white/30 rounded-full animate-pulse delay-1500"></div>
        <div className="absolute top-20 left-1/3 w-0.5 h-0.5 bg-white/50 rounded-full animate-pulse delay-700"></div>
      </div>

      {/* Gradient orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/6 w-96 h-96 bg-gradient-to-br from-cyan-500/10 to-blue-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/6 w-80 h-80 bg-gradient-to-br from-purple-500/10 to-pink-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-br from-indigo-500/10 to-purple-500/5 rounded-full blur-3xl animate-pulse delay-2000 transform -translate-x-1/2 -translate-y-1/2"></div>
      </div>

      <div className="max-w-lg w-full relative z-10">
        {/* Logo and Title */}
        <div className={`text-center mb-20 transition-all duration-1500 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h1 className="text-6xl font-thin text-white mb-6 tracking-[0.2em] relative">
            MoodTune
          </h1>
          <div className="w-20 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent mx-auto"></div>
        </div>

        {/* Philosophy */}
        <div className={`text-center space-y-10 mb-20 transition-all duration-1500 delay-300 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="space-y-8 text-white/80 leading-relaxed">
            <div className="space-y-4">
              <p className="text-lg font-light">這裡沒有排行榜，沒有追蹤者，</p>
              <p className="text-lg font-light text-white/60">沒有人會知道你今天哭了，也沒有人會問你為什麼笑。</p>
            </div>

            <div className="my-16 flex justify-center items-center space-x-6">
              <div className="w-12 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent"></div>
              <div className="w-2 h-2 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full animate-pulse"></div>
              <div className="w-12 h-px bg-gradient-to-r from-transparent via-blue-400/50 to-transparent"></div>
            </div>

            <div className="space-y-6">
              <p className="text-2xl font-thin text-white leading-relaxed">這裡，只有你和音樂。</p>
              <p className="text-lg text-white/70 font-light">和一點點，讓你放鬆的顏色與聲音。</p>
            </div>
          </div>
        </div>

        {/* Glassmorphic Entry Cards */}
        <div className={`space-y-5 transition-all duration-1500 delay-600 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <p className="text-center text-lg text-white/70 mb-12 font-light">深吸一口氣。你正在一個安全的角落。</p>

          <div className="space-y-4">
            {/* Mood Check Card */}
            <div 
              onClick={handleEnter}
              className="w-full p-8 rounded-3xl backdrop-blur-md bg-gradient-to-br from-cyan-500/20 to-blue-500/10 border border-white/10 transition-all duration-500 text-center group hover:bg-gradient-to-br hover:from-cyan-500/30 hover:to-blue-500/20 cursor-pointer hover:border-cyan-400/30 hover:-translate-y-1 active:translate-y-0"
            >
              <div className="flex flex-col items-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400/30 to-blue-400/20 flex items-center justify-center mb-2">
                  <div className="w-4 h-4 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full"></div>
                </div>
                <div className="text-lg font-light text-white">我現在感覺如何？</div>
                <div className="text-sm text-white/50">FEELING</div>
              </div>
            </div>

            {/* Comfort Card */}
            <div 
              onClick={handleEnter}
              className="w-full p-8 rounded-3xl backdrop-blur-md bg-gradient-to-br from-purple-500/20 to-pink-500/10 border border-white/10 transition-all duration-500 text-center group hover:bg-gradient-to-br hover:from-purple-500/30 hover:to-pink-500/20 cursor-pointer hover:border-purple-400/30 hover:-translate-y-1 active:translate-y-0"
            >
              <div className="flex flex-col items-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400/30 to-pink-400/20 flex items-center justify-center mb-2">
                  <div className="w-4 h-4 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"></div>
                </div>
                <div className="text-lg font-light text-white">我需要一些慰藉</div>
                <div className="text-sm text-white/50">COMFORT</div>
              </div>
            </div>

            {/* Quiet Listening Card */}
            <div 
              onClick={handleEnter}
              className="w-full p-8 rounded-3xl backdrop-blur-md bg-gradient-to-br from-indigo-500/20 to-purple-500/10 border border-white/10 transition-all duration-500 text-center group hover:bg-gradient-to-br hover:from-indigo-500/30 hover:to-purple-500/20 cursor-pointer hover:border-indigo-400/30 hover:-translate-y-1 active:translate-y-0"
            >
              <div className="flex flex-col items-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400/30 to-purple-400/20 flex items-center justify-center mb-2">
                  <div className="w-4 h-4 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full"></div>
                </div>
                <div className="text-lg font-light text-white">只想安靜聽聽</div>
                <div className="text-sm text-white/50">QUIET</div>
              </div>
            </div>
          </div>

          {/* Main Entry Button */}
          <div className="pt-10">
            <div 
              onClick={handleEnter}
              className="w-full p-8 rounded-3xl backdrop-blur-md bg-gradient-to-br from-white/10 to-white/5 border border-white/20 transition-all duration-500 text-center group hover:bg-gradient-to-br hover:from-white/20 hover:to-white/10 cursor-pointer hover:border-white/30 hover:-translate-y-1 active:translate-y-0 relative overflow-hidden"
            >
              <div className="flex flex-col items-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-white/20 to-white/10 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300">
                  <div className="w-6 h-6 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 rounded-full"></div>
                </div>
                <div className="text-xl font-light text-white">進入療癒空間</div>
                <div className="text-sm text-white/60 tracking-widest">HEALING SPACE</div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>
            </div>
          </div>
        </div>

        {/* Time Display */}
        <div className={`mt-16 text-center transition-all duration-2000 delay-1000 ${showContent ? 'opacity-100' : 'opacity-0'}`}>
          <div className="text-4xl font-thin text-white/90 mb-2">
            {new Date().toLocaleTimeString('zh-TW', { 
              hour12: false,
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </div>
          <div className="text-sm text-white/50 tracking-widest">
            {new Date().toLocaleDateString('zh-TW', { 
              month: 'long', 
              day: 'numeric' 
            }).toUpperCase()}
          </div>
        </div>

        {/* Footer */}
        <div className={`mt-20 text-center transition-all duration-2000 delay-1500 ${showContent ? 'opacity-60' : 'opacity-0'}`}>
          <p className="text-xs text-white/40 font-light tracking-[0.2em]">為你的心情而生</p>
        </div>
      </div>
    </div>
  );
}