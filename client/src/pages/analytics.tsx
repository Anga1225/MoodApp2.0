import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, TrendingUp, Calendar, BarChart3, PieChart } from 'lucide-react';
import { useMoodHistory, useMoodAnalytics } from '@/hooks/useMoodTracking';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { format, subDays, eachDayOfInterval, isSameDay } from 'date-fns';
import type { MoodEntry } from '@shared/schema';

interface AnalyticsPageProps {
  onBack: () => void;
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1'];

export function AnalyticsPage({ onBack }: AnalyticsPageProps) {
  const { data: moodHistory = [], isLoading: historyLoading } = useMoodHistory(100);
  const { data: analytics, isLoading: analyticsLoading } = useMoodAnalytics();

  // Use analytics data trends if available, otherwise prepare from mood history
  let trendData = [];
  
  if (analytics && typeof analytics === 'object' && 'trends' in analytics && (analytics as any).trends) {
    // Format analytics trends data for display
    trendData = (analytics as any).trends.slice(0, 30).map((trend: any, index: number) => ({
      date: format(new Date(trend.date), 'MM/dd'),
      fullDate: format(new Date(trend.date), 'yyyy-MM-dd'),
      happiness: trend.happiness,
      calmness: trend.calmness,
      count: 1
    })).reverse(); // Reverse to show oldest first
  } else {
    // Fallback: prepare trend data from mood history for the last 30 days
    const last30Days = eachDayOfInterval({
      start: subDays(new Date(), 29),
      end: new Date()
    });

    trendData = last30Days.map(date => {
      const dayMoods = moodHistory.filter(mood => 
        isSameDay(new Date(mood.timestamp), date)
      );
      
      const avgHappiness = dayMoods.length > 0 
        ? dayMoods.reduce((sum, mood) => sum + mood.happiness, 0) / dayMoods.length 
        : null;
      const avgCalmness = dayMoods.length > 0 
        ? dayMoods.reduce((sum, mood) => sum + mood.calmness, 0) / dayMoods.length 
        : null;

      return {
        date: format(date, 'MM/dd'),
        fullDate: format(date, 'yyyy-MM-dd'),
        happiness: avgHappiness ? Math.round(avgHappiness) : null,
        calmness: avgCalmness ? Math.round(avgCalmness) : null,
        count: dayMoods.length
      };
    });
  }

  // Prepare mood distribution data
  const moodDistribution = moodHistory.reduce((acc: Record<string, number>, mood) => {
    const moodType = mood.quickMood || 'custom';
    acc[moodType] = (acc[moodType] || 0) + 1;
    return acc;
  }, {});

  const pieData = Object.entries(moodDistribution).map(([mood, count]) => ({
    name: mood === 'custom' ? '自定義' : mood,
    value: count,
    percentage: Math.round((count / moodHistory.length) * 100)
  }));

  // Prepare weekly stats
  const weeklyStats = [];
  for (let i = 0; i < 4; i++) {
    const weekStart = subDays(new Date(), (i + 1) * 7);
    const weekEnd = subDays(new Date(), i * 7);
    const weekMoods = moodHistory.filter(mood => {
      const moodDate = new Date(mood.timestamp);
      return moodDate >= weekStart && moodDate <= weekEnd;
    });
    
    if (weekMoods.length > 0) {
      weeklyStats.unshift({
        week: `第${4-i}週`,
        happiness: Math.round(weekMoods.reduce((sum, mood) => sum + mood.happiness, 0) / weekMoods.length),
        calmness: Math.round(weekMoods.reduce((sum, mood) => sum + mood.calmness, 0) / weekMoods.length),
        count: weekMoods.length
      });
    }
  }

  if (historyLoading || analyticsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" onClick={onBack} className="p-2">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">心情分析載入中...</h1>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="p-6 animate-pulse">
                <div className="h-4 bg-gray-300 rounded w-3/4 mb-4"></div>
                <div className="h-32 bg-gray-300 rounded"></div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 overflow-hidden">
      {/* Mountain Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-600/20 to-slate-900/40"></div>
      <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-slate-900 via-slate-800/60 to-transparent"></div>
      
      <div className="relative z-10 container mx-auto px-4 py-8 max-w-6xl">
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
            <h1 className="text-3xl font-bold text-white">心情分析</h1>
            <p className="text-slate-300 mt-1">深入了解您的心情變化模式</p>
          </div>
        </div>

        {/* Gradient Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="group">
            <div className="relative h-32 rounded-3xl bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 p-6 transition-transform hover:scale-105 cursor-pointer shadow-lg">
              <div className="absolute top-4 left-4 text-white/80 text-sm font-medium">
                平均快樂度
              </div>
              <div className="absolute bottom-4 left-4 text-white text-3xl font-bold">
                {analytics && typeof analytics === 'object' && 'averageHappiness' in analytics ? (analytics as any).averageHappiness : 0}
              </div>
              <div className="absolute top-4 right-4 text-white/60 text-xs">
                #4A90E2
              </div>
            </div>
          </div>
          
          <div className="group">
            <div className="relative h-32 rounded-3xl bg-gradient-to-br from-emerald-400 via-emerald-500 to-emerald-600 p-6 transition-transform hover:scale-105 cursor-pointer shadow-lg">
              <div className="absolute top-4 left-4 text-white/80 text-sm font-medium">
                平均平靜度
              </div>
              <div className="absolute bottom-4 left-4 text-white text-3xl font-bold">
                {analytics && typeof analytics === 'object' && 'averageCalmness' in analytics ? (analytics as any).averageCalmness : 0}
              </div>
              <div className="absolute top-4 right-4 text-white/60 text-xs">
                #10B981
              </div>
            </div>
          </div>
          
          <div className="group">
            <div className="relative h-32 rounded-3xl bg-gradient-to-br from-purple-400 via-purple-500 to-purple-600 p-6 transition-transform hover:scale-105 cursor-pointer shadow-lg">
              <div className="absolute top-4 left-4 text-white/80 text-sm font-medium">
                記錄總數
              </div>
              <div className="absolute bottom-4 left-4 text-white text-3xl font-bold">
                {moodHistory.length}
              </div>
              <div className="absolute top-4 right-4 text-white/60 text-xs">
                #8B5CF6
              </div>
            </div>
          </div>
          
          <div className="group">
            <div className="relative h-32 rounded-3xl bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 p-6 transition-transform hover:scale-105 cursor-pointer shadow-lg">
              <div className="absolute top-4 left-4 text-white/80 text-sm font-medium">
                本週記錄
              </div>
              <div className="absolute bottom-4 left-4 text-white text-3xl font-bold">
                {moodHistory.filter(mood => 
                  new Date(mood.timestamp) >= subDays(new Date(), 7)
                ).length}
              </div>
              <div className="absolute top-4 right-4 text-white/60 text-xs">
                #F97316
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <Tabs defaultValue="trends" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-slate-800/50 border-slate-600">
            <TabsTrigger value="trends" className="text-slate-300 data-[state=active]:text-white data-[state=active]:bg-slate-700">趨勢分析</TabsTrigger>
            <TabsTrigger value="distribution" className="text-slate-300 data-[state=active]:text-white data-[state=active]:bg-slate-700">心情分佈</TabsTrigger>
            <TabsTrigger value="weekly" className="text-slate-300 data-[state=active]:text-white data-[state=active]:bg-slate-700">週統計</TabsTrigger>
            <TabsTrigger value="patterns" className="text-slate-300 data-[state=active]:text-white data-[state=active]:bg-slate-700">模式分析</TabsTrigger>
          </TabsList>

          <TabsContent value="trends">
            <Card className="p-6 bg-slate-800/30 border-slate-600 backdrop-blur-sm">
              <h3 className="text-xl font-bold text-white mb-6">心情趨勢分析</h3>
              {trendData.length === 0 ? (
                <div className="h-80 flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <div className="text-4xl mb-4 text-gray-400">📊</div>
                    <p className="text-gray-600 font-medium">暫無趨勢數據</p>
                    <p className="text-sm text-gray-500 mt-2">記錄更多心情來查看趨勢圖表</p>
                  </div>
                </div>
              ) : (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 12 }} 
                        tickLine={{ stroke: '#6B7280' }}
                      />
                      <YAxis 
                        domain={[0, 100]} 
                        tick={{ fontSize: 12 }}
                        tickLine={{ stroke: '#6B7280' }}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #E5E7EB',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                        labelStyle={{ color: '#374151', fontWeight: 'bold' }}
                        labelFormatter={(label) => `日期: ${label}`}
                        formatter={(value: number, name: string) => [
                          value ? `${value}分` : '無數據', 
                          name === 'happiness' ? '快樂度' : '平靜度'
                        ]}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="happiness" 
                        stroke="#8B5CF6" 
                        strokeWidth={3}
                        dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
                        name="happiness"
                        connectNulls={false}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="calmness" 
                        stroke="#06B6D4" 
                        strokeWidth={3}
                        dot={{ fill: '#06B6D4', strokeWidth: 2, r: 4 }}
                        name="calmness"
                        connectNulls={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="distribution">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6">心情類型分佈</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percentage }: { name: string; percentage: number }) => `${name} ${percentage}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </Card>
              
              <Card className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6">心情數值分佈</h3>
                <div className="space-y-4">
                  {pieData.map((item, index) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="text-sm font-medium">{item.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold">{item.value}</span>
                        <span className="text-xs text-gray-500 ml-1">({item.percentage}%)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="weekly">
            <Card className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">週統計比較</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Bar dataKey="happiness" fill="#8884d8" name="快樂度" />
                    <Bar dataKey="calmness" fill="#82ca9d" name="平靜度" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="patterns">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6">心情模式洞察</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-900">最常見心情</h4>
                    <p className="text-blue-700">
                      {pieData.length > 0 ? pieData[0].name : '暫無數據'}
                      {pieData.length > 0 && ` (${pieData[0].percentage}%)`}
                    </p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-semibold text-green-900">平均快樂指數</h4>
                    <p className="text-green-700">
                      {analytics && typeof analytics === 'object' && 'averageHappiness' in analytics ? (analytics as any).averageHappiness : 0}分 / 100分
                    </p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h4 className="font-semibold text-purple-900">平均平靜指數</h4>
                    <p className="text-purple-700">
                      {analytics && typeof analytics === 'object' && 'averageCalmness' in analytics ? (analytics as any).averageCalmness : 0}分 / 100分
                    </p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6">記錄活動</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={trendData.filter(d => d.count > 0)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value: number) => [`${value}筆`, '記錄數量']}
                      />
                      <Bar dataKey="count" fill="#ffc658" name="每日記錄數" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}