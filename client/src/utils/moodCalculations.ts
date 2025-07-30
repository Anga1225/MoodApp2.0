export interface MoodState {
  happiness: number;
  calmness: number;
  label: string;
  description: string;
}

export const moodPresets = {
  happy: { happiness: 80, calmness: 70 },
  sad: { happiness: 20, calmness: 40 },
  anxious: { happiness: 30, calmness: 15 },
  calm: { happiness: 60, calmness: 85 },
  excited: { happiness: 90, calmness: 40 },
  tired: { happiness: 30, calmness: 80 },
  angry: { happiness: 25, calmness: 20 },
  peaceful: { happiness: 70, calmness: 90 }
};

export function calculateMoodLabel(happiness: number, calmness: number): string {
  if (happiness >= 70 && calmness >= 70) return "Joyful & Peaceful";
  if (happiness >= 70 && calmness >= 40) return "Happy & Content";
  if (happiness >= 70 && calmness < 40) return "Excited & Energetic";
  if (happiness >= 40 && calmness >= 70) return "Calm & Balanced";
  if (happiness >= 40 && calmness >= 40) return "Neutral & Stable";
  if (happiness >= 40 && calmness < 40) return "Restless";
  if (happiness < 40 && calmness >= 70) return "Sad but Peaceful";
  if (happiness < 40 && calmness >= 40) return "Melancholy";
  return "Anxious & Troubled";
}

export function calculateMoodDescription(happiness: number, calmness: number): string {
  const label = calculateMoodLabel(happiness, calmness);
  
  const descriptions: Record<string, string> = {
    "Joyful & Peaceful": "You're in a wonderful state of happiness and tranquility",
    "Happy & Content": "You're feeling positive and satisfied with life",
    "Excited & Energetic": "You're buzzing with enthusiasm and energy",
    "Calm & Balanced": "You're in a peaceful and centered state of mind",
    "Neutral & Stable": "You're feeling balanced and steady",
    "Restless": "You might be feeling a bit unsettled or eager for change",
    "Sad but Peaceful": "You're experiencing sadness but with inner peace",
    "Melancholy": "You're feeling a gentle sadness or pensiveness",
    "Anxious & Troubled": "You might be feeling overwhelmed or worried"
  };
  
  return descriptions[label] || "Your current emotional state";
}

export function validateMoodValues(happiness: number, calmness: number): boolean {
  return happiness >= 0 && happiness <= 100 && calmness >= 0 && calmness <= 100;
}

export function calculateMoodTrend(entries: Array<{ happiness: number; calmness: number; timestamp: Date }>): {
  happinessTrend: 'up' | 'down' | 'stable';
  calmnessTrend: 'up' | 'down' | 'stable';
  overallTrend: 'improving' | 'declining' | 'stable';
} {
  if (entries.length < 2) {
    return { happinessTrend: 'stable', calmnessTrend: 'stable', overallTrend: 'stable' };
  }

  const recent = entries.slice(0, Math.min(5, entries.length));
  const older = entries.slice(Math.min(5, entries.length), Math.min(10, entries.length));

  if (older.length === 0) {
    return { happinessTrend: 'stable', calmnessTrend: 'stable', overallTrend: 'stable' };
  }

  const recentAvgHappiness = recent.reduce((sum, e) => sum + e.happiness, 0) / recent.length;
  const olderAvgHappiness = older.reduce((sum, e) => sum + e.happiness, 0) / older.length;
  const recentAvgCalmness = recent.reduce((sum, e) => sum + e.calmness, 0) / recent.length;
  const olderAvgCalmness = older.reduce((sum, e) => sum + e.calmness, 0) / older.length;

  const happinessDiff = recentAvgHappiness - olderAvgHappiness;
  const calmnessDiff = recentAvgCalmness - olderAvgCalmness;

  return {
    happinessTrend: happinessDiff > 5 ? 'up' : happinessDiff < -5 ? 'down' : 'stable',
    calmnessTrend: calmnessDiff > 5 ? 'up' : calmnessDiff < -5 ? 'down' : 'stable',
    overallTrend: (happinessDiff + calmnessDiff) > 5 ? 'improving' : 
                  (happinessDiff + calmnessDiff) < -5 ? 'declining' : 'stable'
  };
}
