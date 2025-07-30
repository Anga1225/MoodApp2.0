import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useMoodAnalytics } from '@/hooks/useMoodTracking';

interface TrendChartProps {
  data?: any;
  isLoading: boolean;
}

function TrendChart({ data, isLoading }: TrendChartProps) {
  if (isLoading) {
    return (
      <div className="h-64 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl flex items-center justify-center animate-pulse">
        <div className="text-center">
          <div className="w-12 h-12 bg-gray-300 rounded-full mx-auto mb-2" />
          <p className="text-gray-400">Loading chart...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-64 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <svg viewBox="0 0 400 200" className="w-full h-full">
          <path d="M0,150 Q100,120 200,100 T400,80" stroke="hsl(247, 84%, 75%)" strokeWidth="3" fill="none" className="opacity-60"/>
          <path d="M0,180 Q100,160 200,140 T400,120" stroke="hsl(267, 47%, 65%)" strokeWidth="3" fill="none" className="opacity-60"/>
        </svg>
      </div>
      <div className="text-center z-10">
        <svg className="w-16 h-16 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <p className="text-gray-600 font-medium">Mood Trend Chart</p>
        <p className="text-xs text-gray-500">Interactive visualization</p>
      </div>
    </div>
  );
}

export function Analytics() {
  const { data: analytics, isLoading, error } = useMoodAnalytics();

  if (error) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Mood Trends</h3>
          <div className="text-center py-8">
            <p className="text-red-600 mb-2">Failed to load analytics</p>
            <p className="text-sm text-gray-500">Please try again later</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Mood Trends */}
      <Card className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900">Mood Trends</h3>
          <div className="flex space-x-2">
            <Button variant="secondary" size="sm" className="px-3 py-1 text-xs bg-primary/10 text-primary rounded-lg font-medium">
              Week
            </Button>
            <Button variant="ghost" size="sm" className="px-3 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded-lg">
              Month
            </Button>
          </div>
        </div>
        
        <TrendChart data={analytics} isLoading={isLoading} />
        
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-xl">
            <p className="text-2xl font-bold text-primary">
              {isLoading ? '...' : analytics?.averageHappiness || 0}
            </p>
            <p className="text-sm text-gray-600">Avg Happiness</p>
          </div>
          <div className="text-center p-4 bg-gradient-to-r from-purple-500/10 to-primary/10 rounded-xl">
            <p className="text-2xl font-bold text-purple-600">
              {isLoading ? '...' : analytics?.averageCalmness || 0}
            </p>
            <p className="text-sm text-gray-600">Avg Calmness</p>
          </div>
        </div>
      </Card>

      {/* Color Patterns */}
      <Card className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Color Patterns</h3>
        
        <div className="mb-6">
          <p className="text-sm font-semibold text-gray-700 mb-3">Most Common Mood Colors</p>
          <div className="flex space-x-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 flex-shrink-0" title="Happy & Energetic" />
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-teal-400 flex-shrink-0" title="Calm & Peaceful" />
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex-shrink-0" title="Creative & Excited" />
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-400 to-blue-400 flex-shrink-0" title="Balanced & Content" />
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-red-400 to-orange-400 flex-shrink-0" title="Energetic & Passionate" />
          </div>
        </div>
        
        <div className="h-48 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl flex items-center justify-center relative overflow-hidden mb-6">
          <div 
            className="absolute inset-4 rounded-full"
            style={{
              background: 'conic-gradient(from 0deg, #ff6b6b 0deg 60deg, #feca57 60deg 120deg, #48dbfb 120deg 180deg, #ff9ff3 180deg 240deg, #54a0ff 240deg 300deg, #5f27cd 300deg 360deg)'
            }}
          />
          <div className="w-24 h-24 bg-white rounded-full shadow-lg flex items-center justify-center z-10">
            <div className="text-center">
              <svg className="w-8 h-8 text-gray-400 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a4 4 0 004-4V5z" />
              </svg>
              <p className="text-xs text-gray-600 font-medium">Color Wheel</p>
            </div>
          </div>
        </div>
        
        <div className="p-4 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-xl">
          <div className="flex items-start space-x-3">
            <svg className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <div>
              <p className="text-sm font-semibold text-gray-900 mb-1">Insight</p>
              <p className="text-xs text-gray-600">
                {isLoading ? 'Analyzing your mood patterns...' : 
                 analytics?.totalEntries > 0 ? 
                 'Your mood colors show a balanced emotional range with positive trends.' :
                 'Start tracking your mood to see personalized insights here.'}
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
