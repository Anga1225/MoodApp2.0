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

  // Prepare trend data for the last 30 days
  const last30Days = eachDayOfInterval({
    start: subDays(new Date(), 29),
    end: new Date()
  });

  const trendData = last30Days.map(date => {
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            onClick={onBack}
            className="p-2 hover:bg-white/50 rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">心情分析報告</h1>
            <p className="text-gray-600 mt-1">深入了解您的心情變化模式</p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">平均快樂度</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics && typeof analytics === 'object' && 'averageHappiness' in analytics ? (analytics as any).averageHappiness : 0}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">平均平靜度</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics && typeof analytics === 'object' && 'averageCalmness' in analytics ? (analytics as any).averageCalmness : 0}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-blue-500" />
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">記錄總數</p>
                <p className="text-2xl font-bold text-gray-900">{moodHistory.length}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-purple-500" />
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">本週記錄</p>
                <p className="text-2xl font-bold text-gray-900">
                  {moodHistory.filter(mood => 
                    new Date(mood.timestamp) >= subDays(new Date(), 7)
                  ).length}
                </p>
              </div>
              <PieChart className="w-8 h-8 text-orange-500" />
            </div>
          </Card>
        </div>

        {/* Charts */}
        <Tabs defaultValue="trends" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="trends">趨勢分析</TabsTrigger>
            <TabsTrigger value="distribution">心情分佈</TabsTrigger>
            <TabsTrigger value="weekly">週統計</TabsTrigger>
            <TabsTrigger value="patterns">模式分析</TabsTrigger>
          </TabsList>

          <TabsContent value="trends">
            <Card className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">30天心情趨勢</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip 
                      labelFormatter={(label) => `日期: ${label}`}
                      formatter={(value: number, name: string) => [
                        value ? `${value}分` : '無數據', 
                        name === 'happiness' ? '快樂度' : '平靜度'
                      ]}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="happiness" 
                      stackId="1" 
                      stroke="#8884d8" 
                      fill="#8884d8" 
                      fillOpacity={0.6}
                      connectNulls={false}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="calmness" 
                      stackId="2" 
                      stroke="#82ca9d" 
                      fill="#82ca9d" 
                      fillOpacity={0.6}
                      connectNulls={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
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