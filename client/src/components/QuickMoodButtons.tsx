import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { moodPresets } from '@/utils/moodCalculations';

interface MoodButtonProps {
  emoji: string;
  label: string;
  chineseLabel: string;
  isActive?: boolean;
  onClick: () => void;
  disabled?: boolean;
  gradient: string;
}

function MoodButton({ emoji, label, chineseLabel, isActive, onClick, disabled, gradient }: MoodButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`mood-button p-4 rounded-xl text-center transition-all duration-300 ${gradient} ${
        isActive ? 'ring-2 ring-primary ring-offset-2' : ''
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg'}`}
    >
      <div className="text-3xl mb-2">{emoji}</div>
      <div className="text-sm font-semibold text-gray-800">{label}</div>
      <div className="text-xs text-gray-600">{chineseLabel}</div>
    </button>
  );
}

interface QuickMoodButtonsProps {
  onMoodSelect: (moodType: keyof typeof moodPresets) => void;
  onSave: () => void;
  notes: string;
  onNotesChange: (notes: string) => void;
  isSaving?: boolean;
  disabled?: boolean;
  onSaveAnonymous?: () => void;
}

export function QuickMoodButtons({ 
  onMoodSelect, 
  onSave, 
  notes, 
  onNotesChange, 
  isSaving = false,
  disabled = false,
  onSaveAnonymous
}: QuickMoodButtonsProps) {
  const moods = [
    { id: 'happy' as const, emoji: '😊', label: '快樂', chinese: '快樂', gradient: 'bg-gradient-to-br from-yellow-100 to-yellow-200 hover:from-yellow-200 hover:to-yellow-300' },
    { id: 'sad' as const, emoji: '😢', label: '悲傷', chinese: '悲傷', gradient: 'bg-gradient-to-br from-blue-100 to-blue-200 hover:from-blue-200 hover:to-blue-300' },
    { id: 'anxious' as const, emoji: '😰', label: '焦慮', chinese: '焦慮', gradient: 'bg-gradient-to-br from-red-100 to-red-200 hover:from-red-200 hover:to-red-300' },
    { id: 'calm' as const, emoji: '😌', label: '平靜', chinese: '平靜', gradient: 'bg-gradient-to-br from-green-100 to-green-200 hover:from-green-200 hover:to-green-300' },
    { id: 'excited' as const, emoji: '🤩', label: '興奮', chinese: '興奮', gradient: 'bg-gradient-to-br from-purple-100 to-purple-200 hover:from-purple-200 hover:to-purple-300' },
    { id: 'tired' as const, emoji: '😴', label: '疲憊', chinese: '疲憊', gradient: 'bg-gradient-to-br from-indigo-100 to-indigo-200 hover:from-indigo-200 hover:to-indigo-300' },
    { id: 'angry' as const, emoji: '😠', label: '憤怒', chinese: '憤怒', gradient: 'bg-gradient-to-br from-orange-100 to-orange-200 hover:from-orange-200 hover:to-orange-300' },
    { id: 'peaceful' as const, emoji: '🧘', label: '寧靜', chinese: '寧靜', gradient: 'bg-gradient-to-br from-teal-100 to-teal-200 hover:from-teal-200 hover:to-teal-300' }
  ];

  return (
    <Card className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
      <h3 className="text-xl font-bold text-gray-900 mb-6">快速心情選擇</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {moods.map((mood) => (
          <MoodButton
            key={mood.id}
            emoji={mood.emoji}
            label={mood.label}
            chineseLabel={mood.chinese}
            onClick={() => onMoodSelect(mood.id)}
            disabled={disabled || isSaving}
            gradient={mood.gradient}
          />
        ))}
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            備註 (可選)
          </label>
          <Textarea
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            placeholder="您現在感覺如何？您在想什麼？"
            className="min-h-[80px]"
            disabled={disabled || isSaving}
          />
        </div>

        <div className="grid grid-cols-1 gap-3">
          <Button
            onClick={onSave}
            disabled={disabled || isSaving}
            className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02]"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                儲存中...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                儲存心情記錄
              </>
            )}
          </Button>
          
          {onSaveAnonymous && (
            <Button
              onClick={onSaveAnonymous}
              disabled={disabled || isSaving}
              variant="outline"
              className="w-full border-2 border-blue-300 text-blue-600 hover:bg-blue-50 hover:border-blue-400 font-medium py-4 px-6 rounded-xl transition-all duration-300"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              悄悄分享，讓別人知道他們不孤單
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
