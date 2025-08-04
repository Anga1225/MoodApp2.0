import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar as LucideCalendar, Filter, Download } from 'lucide-react';
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900 relative overflow-hidden">
      {/* Starry background effect */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-20 w-1 h-1 bg-white/40 rounded-full animate-pulse"></div>
        <div className="absolute top-32 right-32 w-1 h-1 bg-white/30 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute bottom-40 left-1/4 w-0.5 h-0.5 bg-white/50 rounded-full animate-pulse delay-2000"></div>
        <div className="absolute top-1/3 right-1/4 w-0.5 h-0.5 bg-white/40 rounded-full animate-pulse delay-500"></div>
        <div className="absolute bottom-1/3 right-20 w-1 h-1 bg-white/30 rounded-full animate-pulse delay-1500"></div>
        <div className="absolute top-20 left-1/3 w-0.5 h-0.5 bg-white/50 rounded-full animate-pulse delay-700"></div>
        <div className="absolute bottom-20 right-1/3 w-0.5 h-0.5 bg-white/40 rounded-full animate-pulse delay-300"></div>
        <div className="absolute top-40 right-10 w-0.5 h-0.5 bg-white/50 rounded-full animate-pulse delay-1200"></div>
      </div>

      {/* Gradient orbs */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/6 w-96 h-96 bg-gradient-to-br from-cyan-500/10 to-blue-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/6 w-80 h-80 bg-gradient-to-br from-purple-500/10 to-pink-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-6 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={onBack}
              className="p-3 hover:bg-white/10 rounded-full text-white backdrop-blur-sm bg-white/5 border border-white/10 transition-all duration-300 hover:scale-110"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-4xl font-thin text-white tracking-wide">心情歷史</h1>
              <p className="text-white/70 mt-2 font-light">瀏覽和分析您的心情變化</p>
            </div>
          </div>

          <Button
            onClick={exportData}
            className="backdrop-blur-md bg-gradient-to-r from-cyan-500/30 to-blue-500/30 border border-cyan-400/30 hover:from-cyan-500/40 hover:to-blue-500/40 text-white rounded-2xl px-6 py-3 transition-all duration-300 hover:-translate-y-1 active:translate-y-0"
            disabled={filteredMoods.length === 0}
          >
            <Download className="w-4 h-4 mr-2" />
            匯出資料
          </Button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-12">
          {/* Filters Sidebar */}
          <div className="xl:col-span-1 space-y-6">
            <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-3xl p-6 min-w-[380px]">
              <h3 className="font-light text-white text-xl mb-6 flex items-center gap-3">
                <Filter className="w-5 h-5 text-cyan-400" />
                篩選條件
              </h3>

              {/* Date Filter */}
              <div className="space-y-4">
                <label className="text-sm font-light text-white/80 block">選擇日期</label>
                <div className="backdrop-blur-sm bg-white/5 rounded-2xl p-6 border border-white/10 w-full overflow-visible">
                  <div className="w-full min-w-[340px] mx-auto">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      className="w-full text-white [&_.rdp-table]:w-full [&_.rdp-head_row]:justify-between [&_.rdp-row]:justify-between [&_.rdp-head_cell]:text-white/80 [&_.rdp-head_cell]:w-[48px] [&_.rdp-head_cell]:text-center [&_.rdp-head_cell]:text-xs [&_.rdp-cell]:w-[48px] [&_.rdp-cell]:h-[48px] [&_.rdp-day]:text-white/90 [&_.rdp-day]:w-[44px] [&_.rdp-day]:h-[44px] [&_.rdp-day]:text-sm [&_.rdp-day:hover]:text-white [&_.rdp-day_selected]:bg-primary [&_.rdp-day_selected]:text-primary-foreground [&_.rdp-day_today]:text-white [&_.rdp-day_today]:font-bold [&_.rdp-nav_button]:text-white/80 [&_.rdp-nav_button:hover]:text-white [&_.rdp-caption_label]:text-white/90 [&_.rdp-caption_label]:font-medium"
                    />
                  </div>
                </div>
                {selectedDate && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedDate(undefined)}
                    className="w-full mt-2 text-white/70 hover:text-white hover:bg-white/10 backdrop-blur-sm bg-white/5 rounded-2xl border border-white/10"
                  >
                    清除日期篩選
                  </Button>
                )}
              </div>

              {/* Mood Type Filter */}
              <div className="space-y-4 mt-8">
                <label className="text-sm font-light text-white/80 block">心情類型</label>
                <div className="backdrop-blur-sm bg-white/5 rounded-2xl border border-white/10">
                  <Select value={moodFilter} onValueChange={setMoodFilter}>
                    <SelectTrigger className="bg-transparent border-none text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="backdrop-blur-md bg-slate-900/95 border-white/20">
                      <SelectItem value="all" className="text-white hover:bg-white/10">全部心情</SelectItem>
                      <SelectItem value="happy" className="text-white hover:bg-white/10">快樂心情</SelectItem>
                      <SelectItem value="sad" className="text-white hover:bg-white/10">低落心情</SelectItem>
                      <SelectItem value="calm" className="text-white hover:bg-white/10">平靜心情</SelectItem>
                      <SelectItem value="anxious" className="text-white hover:bg-white/10">焦慮心情</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Sort Order */}
              <div className="space-y-4 mt-8">
                <label className="text-sm font-light text-white/80 block">排序方式</label>
                <div className="backdrop-blur-sm bg-white/5 rounded-2xl border border-white/10">
                  <Select value={sortOrder} onValueChange={(value: 'newest' | 'oldest') => setSortOrder(value)}>
                    <SelectTrigger className="bg-transparent border-none text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="backdrop-blur-md bg-slate-900/95 border-white/20">
                      <SelectItem value="newest" className="text-white hover:bg-white/10">最新優先</SelectItem>
                      <SelectItem value="oldest" className="text-white hover:bg-white/10">最舊優先</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Stats Summary */}
            <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-3xl p-6">
              <h3 className="font-light text-white text-xl mb-6">統計摘要</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-light text-white/70">總記錄數</span>
                  <div className="backdrop-blur-sm bg-cyan-500/20 border border-cyan-400/30 px-3 py-1 rounded-full">
                    <span className="text-cyan-300 font-medium">{filteredMoods.length}</span>
                  </div>
                </div>
                {filteredMoods.length > 0 && (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-light text-white/70">平均快樂度</span>
                      <div className="backdrop-blur-sm bg-white/10 border border-white/20 px-3 py-1 rounded-full">
                        <span className="text-white font-medium">
                          {Math.round(filteredMoods.reduce((sum, mood) => sum + mood.happiness, 0) / filteredMoods.length)}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-light text-white/70">平均平靜度</span>
                      <div className="backdrop-blur-sm bg-white/10 border border-white/20 px-3 py-1 rounded-full">
                        <span className="text-white font-medium">
                          {Math.round(filteredMoods.reduce((sum, mood) => sum + mood.calmness, 0) / filteredMoods.length)}
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Mood History List */}
          <div className="xl:col-span-3 xl:ml-8">
            <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-3xl p-8">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-thin text-white">心情記錄</h3>
                <div className="text-sm text-white/60 font-light">
                  共 {filteredMoods.length} 筆記錄
                </div>
              </div>

              {isLoading ? (
                <div className="space-y-6">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-6 p-6 backdrop-blur-sm bg-white/5 rounded-2xl border border-white/10 animate-pulse">
                      <div className="w-16 h-16 rounded-full bg-white/20" />
                      <div className="flex-1 space-y-3">
                        <div className="h-4 bg-white/20 rounded w-3/4" />
                        <div className="h-3 bg-white/15 rounded w-1/2" />
                        <div className="h-3 bg-white/15 rounded w-2/3" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredMoods.length === 0 ? (
                <div className="text-center py-20">
                  <LucideCalendar className="w-16 h-16 text-white/40 mx-auto mb-6" />
                  <p className="text-white/70 text-lg font-light mb-3">沒有找到符合條件的心情記錄</p>
                  <p className="text-sm text-white/50 font-light">請調整篩選條件或新增更多心情記錄</p>
                </div>
              ) : (
                <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                  {filteredMoods.map((mood) => (
                    <div
                      key={mood.id}
                      className="flex items-start space-x-6 p-6 backdrop-blur-sm bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all duration-300 hover:-translate-y-1 group"
                    >
                      <div
                        className="w-16 h-16 rounded-full flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300"
                        style={{ background: `linear-gradient(135deg, ${mood.colorHex}, ${mood.colorHex}dd)` }}
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-4 mb-3">
                          <h4 className="font-light text-white text-lg">
                            {mood.quickMood ? 
                              mood.quickMood.charAt(0).toUpperCase() + mood.quickMood.slice(1) : 
                              calculateMoodLabel(mood.happiness, mood.calmness)
                            }
                          </h4>
                          <div className="backdrop-blur-sm bg-white/10 border border-white/20 px-3 py-1 rounded-full">
                            <span className="text-white/80 text-xs font-mono">
                              {format(new Date(mood.timestamp), 'MM/dd HH:mm')}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-6 mb-4">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-white/60 font-light">快樂度:</span>
                            <div className={`px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm border ${
                              mood.happiness >= 70 
                                ? 'bg-emerald-500/20 border-emerald-400/30 text-emerald-300' 
                                : mood.happiness >= 40 
                                ? 'bg-yellow-500/20 border-yellow-400/30 text-yellow-300'
                                : 'bg-red-500/20 border-red-400/30 text-red-300'
                            }`}>
                              {mood.happiness}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-white/60 font-light">平靜度:</span>
                            <div className={`px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm border ${
                              mood.calmness >= 70 
                                ? 'bg-blue-500/20 border-blue-400/30 text-blue-300' 
                                : mood.calmness >= 40 
                                ? 'bg-indigo-500/20 border-indigo-400/30 text-indigo-300'
                                : 'bg-purple-500/20 border-purple-400/30 text-purple-300'
                            }`}>
                              {mood.calmness}
                            </div>
                          </div>
                        </div>

                        {mood.notes && (
                          <p className="text-sm text-white/80 backdrop-blur-sm bg-white/5 p-4 rounded-xl border border-white/10 mt-3 font-light leading-relaxed">
                            "{mood.notes}"
                          </p>
                        )}

                        <p className="text-xs text-white/50 mt-3 font-light">
                          {formatDistanceToNow(new Date(mood.timestamp), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}