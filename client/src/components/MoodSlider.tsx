import { useCallback } from 'react';
import { Slider } from '@/components/ui/slider';
import { Card } from '@/components/ui/card';

interface MoodSliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  icon: string;
  color: string;
  min?: string;
  neutral?: string;
  max?: string;
  disabled?: boolean;
}

export function MoodSlider({ 
  label, 
  value, 
  onChange, 
  icon, 
  color,
  min = "Low",
  neutral = "Neutral", 
  max = "High",
  disabled = false
}: MoodSliderProps) {
  const handleChange = useCallback((values: number[]) => {
    onChange(values[0]);
  }, [onChange]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <label className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <span className={`text-${color}-500`}>{icon}</span>
          {label}
        </label>
        <span className="text-2xl font-bold text-primary">{value}</span>
      </div>
      
      <div className="relative">
        <Slider
          value={[value]}
          onValueChange={handleChange}
          max={100}
          min={0}
          step={1}
          disabled={disabled}
          className="mood-slider"
        />
        
        <div className="flex justify-between text-sm text-gray-500 mt-2">
          <span>{min}</span>
          <span>{neutral}</span>
          <span>{max}</span>
        </div>
      </div>
    </div>
  );
}

interface MoodSlidersProps {
  happiness: number;
  calmness: number;
  onHappinessChange: (value: number) => void;
  onCalmnessChange: (value: number) => void;
  currentMoodLabel: string;
  disabled?: boolean;
}

export function MoodSliders({ 
  happiness, 
  calmness, 
  onHappinessChange, 
  onCalmnessChange,
  currentMoodLabel,
  disabled = false
}: MoodSlidersProps) {
  return (
    <Card className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">How are you feeling?</h2>
        <p className="text-gray-600">Adjust the sliders to express your current mood</p>
      </div>
      
      <div className="space-y-8">
        <MoodSlider
          label="Happiness"
          value={happiness}
          onChange={onHappinessChange}
          icon="😊"
          color="yellow"
          min="😢 Sad"
          neutral="😐 Neutral"
          max="😊 Happy"
          disabled={disabled}
        />
        
        <MoodSlider
          label="Calmness"
          value={calmness}
          onChange={onCalmnessChange}
          icon="🧘"
          color="green"
          min="🌪️ Anxious"
          neutral="😑 Neutral"
          max="🧘 Calm"
          disabled={disabled}
        />
      </div>
      
      <div className="mt-8 p-6 bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-xl">
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-2">Current Mood</p>
          <p className="text-2xl font-bold text-gray-900">{currentMoodLabel}</p>
          <div className="mt-4 flex justify-center space-x-4">
            <div className="text-center">
              <div className="w-4 h-4 rounded-full bg-yellow-400 mx-auto mb-1"></div>
              <p className="text-xs text-gray-600">Happiness: {happiness}%</p>
            </div>
            <div className="text-center">
              <div className="w-4 h-4 rounded-full bg-blue-400 mx-auto mb-1"></div>
              <p className="text-xs text-gray-600">Calmness: {calmness}%</p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
