import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { MoodColor } from '@/utils/colorAlgorithms';

interface ColorDisplayProps {
  color: MoodColor;
  gradient: string;
  onStartTherapy?: () => void;
}

export function ColorDisplay({ color, gradient, onStartTherapy }: ColorDisplayProps) {
  return (
    <Card className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
      <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">Your Mood Color</h3>
      
      <div className="relative mb-6">
        <div 
          className="color-breathing w-48 h-48 mx-auto rounded-full shadow-2xl"
          style={{ background: gradient }}
        />
        <div className="absolute inset-0 rounded-full bg-white/20 animate-pulse pointer-events-none mx-auto w-48 h-48" style={{ animationDuration: '3s' }} />
      </div>
      
      <div className="text-center space-y-3">
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Color Values</p>
          <div className="space-y-1 text-xs">
            <p><span className="font-semibold">HSL:</span> <span>{color.hsl}</span></p>
            <p><span className="font-semibold">Hex:</span> <span>{color.hex}</span></p>
          </div>
        </div>
        
        {onStartTherapy && (
          <Button
            onClick={onStartTherapy}
            className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-medium py-3 px-4 rounded-xl transition-opacity hover:opacity-90"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.01M15 10h1.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Start Color Therapy
          </Button>
        )}
      </div>
    </Card>
  );
}
