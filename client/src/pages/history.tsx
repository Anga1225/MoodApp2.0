import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar as CalendarIcon, Filter, Download } from 'lucide-react';
import { useMoodHistory } from '@/hooks/useMoodTracking';
import { formatDistanceToNow, format, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { calculateMoodLabel } from '@/utils/moodCalculations';
import type { MoodEntry } from '@shared/schema';

interface HistoryPageProps {
  onBack: () => void;
}

export function HistoryPage({ onBack }: HistoryPageProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [moodFilter, setMoodFilter] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  
  const { data: allMoods = [], isLoading } = useMoodHistory(100);

  // Filter moods based on selected criteria
  const filteredMoods = allMoods.filter((mood: MoodEntry) => {
    // Date filter
    if (selectedDate) {
      const moodDate = new Date(mood.timestamp);
      const isInSelectedDay = isWithinInterval(moodDate, {
        start: startOfDay(selectedDate),
        end: endOfDay(selectedDate)
      });
      if (!isInSelectedDay) return false;
    }
    
    // Mood type filter
    if (moodFilter !== 'all') {
      if (moodFilter === 'happy' && mood.happiness < 60) return false;
      if (moodFilter === 'sad' && mood.happiness >= 60) return false;
      if (moodFilter === 'calm' && mood.calmness < 60) return false;
      if (moodFilter === 'anxious' && mood.calmness >= 60) return false;
    }
    
    return true;
  }).sort((a, b) => {
    const dateA = new Date(a.timestamp).getTime();
    const dateB = new Date(b.timestamp).getTime();
    return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
  });

  const exportData = () => {
    const csvContent = [
      ['日期', '時間', '快樂度', '平靜度', '心情', '備註', '顏色'].join(','),
      ...filteredMoods.map(mood => [
        format(new Date(mood.timestamp), 'yyyy-MM-dd'),
        format(new Date(mood.timestamp), 'HH:mm'),
        mood.happiness,
        mood.calmness,
        mood.quickMood || calculateMoodLabel(mood.happiness, mood.calmness),
        `"${mood.notes || ''}"`,
        mood.colorHex
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `mood-history-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 overflow-hidden">
      {/* Mountain Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-600/20 to-slate-900/40"></div>
      <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-slate-900 via-slate-800/60 to-transparent"></div>
      
      <div className="relative z-10 container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={onBack}
              className="p-2 hover:bg-white/10 rounded-full text-white"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white">心情歷史</h1>
              <p className="text-slate-300 mt-1">瀏覽和分析您的心情變化</p>
            </div>
          </div>
          
          <Button
            onClick={exportData}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6"
            disabled={filteredMoods.length === 0}
          >
            <Download className="w-4 h-4 mr-2" />
            匯出資料
          </Button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="xl:col-span-1 space-y-6">
            <Card className="p-4 lg:p-6 bg-slate-800/30 border-slate-600 backdrop-blur-sm">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <Filter className="w-4 h-4" />
                篩選條件
              </h3>
              
              {/* Date Filter */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-slate-300">選擇日期</label>
                <div className="w-full overflow-hidden">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="w-full scale-90 origin-top-left"
                  />
                </div>
                {selectedDate && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedDate(undefined)}
                    className="w-full mt-2"
                  >
                    清除日期篩選
                  </Button>
                )}
              </div>
              
              {/* Mood Type Filter */}
              <div className="space-y-3 mt-6">
                <label className="text-sm font-medium text-gray-700">心情類型</label>
                <Select value={moodFilter} onValueChange={setMoodFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部心情</SelectItem>
                    <SelectItem value="happy">快樂心情</SelectItem>
                    <SelectItem value="sad">低落心情</SelectItem>
                    <SelectItem value="calm">平靜心情</SelectItem>
                    <SelectItem value="anxious">焦慮心情</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Sort Order */}
              <div className="space-y-3 mt-6">
                <label className="text-sm font-medium text-gray-700">排序方式</label>
                <Select value={sortOrder} onValueChange={(value: 'newest' | 'oldest') => setSortOrder(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">最新優先</SelectItem>
                    <SelectItem value="oldest">最舊優先</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </Card>
            
            {/* Stats Summary */}
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">統計摘要</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">總記錄數</span>
                  <Badge variant="secondary">{filteredMoods.length}</Badge>
                </div>
                {filteredMoods.length > 0 && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">平均快樂度</span>
                      <Badge variant="outline">
                        {Math.round(filteredMoods.reduce((sum, mood) => sum + mood.happiness, 0) / filteredMoods.length)}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">平均平靜度</span>
                      <Badge variant="outline">
                        {Math.round(filteredMoods.reduce((sum, mood) => sum + mood.calmness, 0) / filteredMoods.length)}
                      </Badge>
                    </div>
                  </>
                )}
              </div>
            </Card>
          </div>

          {/* Mood History List */}
          <div className="xl:col-span-3">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">心情記錄</h3>
                <div className="text-sm text-gray-500">
                  共 {filteredMoods.length} 筆記錄
                </div>
              </div>
              
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl animate-pulse">
                      <div className="w-16 h-16 rounded-full bg-gray-300" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-300 rounded w-3/4" />
                        <div className="h-3 bg-gray-300 rounded w-1/2" />
                        <div className="h-3 bg-gray-300 rounded w-2/3" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredMoods.length === 0 ? (
                <div className="text-center py-12">
                  <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">沒有找到符合條件的心情記錄</p>
                  <p className="text-sm text-gray-500">請調整篩選條件或新增更多心情記錄</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  {filteredMoods.map((mood) => (
                    <div
                      key={mood.id}
                      className="flex items-start space-x-4 p-4 bg-white border border-gray-100 rounded-xl hover:shadow-md transition-shadow"
                    >
                      <div
                        className="w-16 h-16 rounded-full flex-shrink-0 shadow-lg"
                        style={{ background: `linear-gradient(135deg, ${mood.colorHex}, ${mood.colorHex}dd)` }}
                      />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold text-gray-900">
                            {mood.quickMood ? 
                              mood.quickMood.charAt(0).toUpperCase() + mood.quickMood.slice(1) : 
                              calculateMoodLabel(mood.happiness, mood.calmness)
                            }
                          </h4>
                          <Badge variant="outline" className="text-xs">
                            {format(new Date(mood.timestamp), 'MM/dd HH:mm')}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-4 mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">快樂度:</span>
                            <Badge variant={mood.happiness >= 70 ? 'default' : mood.happiness >= 40 ? 'secondary' : 'destructive'}>
                              {mood.happiness}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">平靜度:</span>
                            <Badge variant={mood.calmness >= 70 ? 'default' : mood.calmness >= 40 ? 'secondary' : 'destructive'}>
                              {mood.calmness}
                            </Badge>
                          </div>
                        </div>
                        
                        {mood.notes && (
                          <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded mt-2">
                            {mood.notes}
                          </p>
                        )}
                        
                        <p className="text-xs text-gray-400 mt-2">
                          {formatDistanceToNow(new Date(mood.timestamp), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}