import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRecentMoods } from '@/hooks/useMoodTracking';
import { formatDistanceToNow } from 'date-fns';
import type { MoodEntry } from '@shared/schema';

interface MoodEntryItemProps {
  entry: MoodEntry;
}

function MoodEntryItem({ entry }: MoodEntryItemProps) {
  return (
    <div className="slide-in-up flex items-center space-x-4 p-4 bg-gray-50 rounded-xl transition-all duration-300 hover:bg-gray-100 cursor-pointer">
      <div 
        className="w-12 h-12 rounded-full flex-shrink-0"
        style={{ background: `linear-gradient(135deg, ${entry.colorHex}, ${entry.colorHex}dd)` }}
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">
          {entry.quickMood ? entry.quickMood.charAt(0).toUpperCase() + entry.quickMood.slice(1) : 'Custom Mood'}
        </p>
        <p className="text-xs text-gray-600">
          {formatDistanceToNow(new Date(entry.timestamp), { addSuffix: true })}
        </p>
        {entry.notes && (
          <p className="text-xs text-gray-500 mt-1 truncate">{entry.notes}</p>
        )}
      </div>
      <div className="text-right">
        <div className="text-xs text-gray-500">H: {entry.happiness} C: {entry.calmness}</div>
      </div>
    </div>
  );
}

interface MoodHistoryProps {
  onViewAll?: () => void;
}

export function MoodHistory({ onViewAll }: MoodHistoryProps) {
  const { data: recentMoods, isLoading, error } = useRecentMoods(5);

  if (error) {
    return (
      <Card className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900">Recent Moods</h3>
        </div>
        <div className="text-center py-8">
          <p className="text-red-600 mb-2">Failed to load mood history</p>
          <p className="text-sm text-gray-500">Please try again later</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-900">Recent Moods</h3>
        {onViewAll && (
          <Button
            variant="ghost"
            onClick={onViewAll}
            className="text-primary hover:text-primary/80 font-medium text-sm"
          >
            View All
          </Button>
        )}
      </div>
      
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl animate-pulse">
              <div className="w-12 h-12 rounded-full bg-gray-300 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-300 rounded w-3/4" />
                <div className="h-3 bg-gray-300 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : !recentMoods || recentMoods.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-6xl mb-4">🎨</div>
          <p className="text-gray-600 mb-2">No mood entries yet</p>
          <p className="text-sm text-gray-500">Start tracking your mood to see your history here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {recentMoods.map((entry) => (
            <MoodEntryItem key={entry.id} entry={entry} />
          ))}
        </div>
      )}
    </Card>
  );
}
