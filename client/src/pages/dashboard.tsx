import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MoodSliders } from '@/components/MoodSlider';
import { QuickMoodButtons } from '@/components/QuickMoodButtons';
import { ColorDisplay } from '@/components/ColorDisplay';
import { MoodHistory } from '@/components/MoodHistory';
import { Analytics } from '@/components/Analytics';
import { MusicRecommendations } from '@/components/MusicRecommendations';
import { GlobalEmotionWall, EmotionStatistics } from '@/components/GlobalEmotionWall';
import { useMoodTracking } from '@/hooks/useMoodTracking';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';

export default function Dashboard() {
  const {
    happiness,
    calmness,
    notes,
    setNotes,
    currentMood,
    updateMood,
    selectQuickMood,
    saveMoodEntry,
    isSaving
  } = useMoodTracking();

  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const handleStartColorTherapy = () => {
    console.log('Navigating to color therapy...');
    setLocation('/test');
  };

  const handleViewHistory = () => {
    console.log('Navigating to history...');
    setLocation('/history');
  };

  const handleViewAnalytics = () => {
    console.log('Navigating to analytics...');
    setLocation('/analytics');
  };

  const handleQuickMoodEntry = () => {
    saveMoodEntry();
  };

  const handleAnonymousMoodEntry = () => {
    saveMoodEntry(undefined, true);
  };

  const getCurrentMoodType = () => {
    if (happiness >= 70 && calmness >= 70) return "peaceful";
    if (happiness >= 70) return "happy";
    if (happiness < 40 && calmness < 40) return "anxious";
    if (happiness < 40) return "sad";
    if (calmness >= 70) return "calm";
    return "happy";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-primary to-purple-600 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">MoodTune</h1>
                <p className="text-xs text-gray-500">v2.0</p>
              </div>
            </div>
            
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#dashboard" className="text-primary font-medium border-b-2 border-primary pb-1">Dashboard</a>
              <a href="#history" className="text-gray-600 hover:text-primary transition-colors">History</a>
              <a href="#analytics" className="text-gray-600 hover:text-primary transition-colors">Analytics</a>
              <a href="#therapy" className="text-gray-600 hover:text-primary transition-colors">Color Therapy</a>
            </nav>
            
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200">
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 19V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V19a2 2 0 01-2 2H6a2 2 0 01-2-2z" />
                </svg>
              </Button>
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-purple-600"></div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Mood Input */}
          <div className="lg:col-span-2 space-y-6">
            <MoodSliders
              happiness={happiness}
              calmness={calmness}
              onHappinessChange={(value) => updateMood(value, undefined)}
              onCalmnessChange={(value) => updateMood(undefined, value)}
              currentMoodLabel={currentMood.label}
              disabled={isSaving}
            />
            
            <QuickMoodButtons
              onMoodSelect={selectQuickMood}
              onSave={() => saveMoodEntry()}
              onSaveAnonymous={handleAnonymousMoodEntry}
              notes={notes}
              onNotesChange={setNotes}
              isSaving={isSaving}
            />
          </div>
          
          {/* Right Column: Color Display & Recent */}
          <div className="space-y-6">
            <ColorDisplay
              color={currentMood.color}
              gradient={currentMood.gradient}
              onStartTherapy={handleStartColorTherapy}
            />
            
            <MoodHistory onViewAll={handleViewHistory} />
            
            <MusicRecommendations moodType={getCurrentMoodType()} />
          </div>
        </div>
        
        {/* Bottom Section: Analytics and Global Features */}
        <div className="mt-8 space-y-8">
          <Analytics />
          
          <GlobalEmotionWall />
          
          <EmotionStatistics />
        </div>
      </main>
      
      {/* Floating Action Button */}
      <Button
        onClick={handleQuickMoodEntry}
        disabled={isSaving}
        className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white rounded-full shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all duration-300 z-50 p-0"
      >
        {isSaving ? (
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        )}
      </Button>
      
      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
        <div className="flex justify-around">
          <button className="flex flex-col items-center space-y-1 py-2 text-primary">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-xs font-medium">Home</span>
          </button>
          
          <button 
            onClick={handleViewHistory}
            className="flex flex-col items-center space-y-1 py-2 text-gray-600 hover:text-primary transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs">History</span>
          </button>
          
          <button 
            onClick={handleViewAnalytics}
            className="flex flex-col items-center space-y-1 py-2 text-gray-600 hover:text-primary transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span className="text-xs">Analytics</span>
          </button>
          
          <button 
            onClick={handleStartColorTherapy}
            className="flex flex-col items-center space-y-1 py-2 text-gray-600 hover:text-primary transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a4 4 0 004-4V5z" />
            </svg>
            <span className="text-xs">Therapy</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
