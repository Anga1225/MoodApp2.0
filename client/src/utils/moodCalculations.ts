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
  if (happiness >= 70 && calmness >= 70) return "喜悅平靜";
  if (happiness >= 70 && calmness >= 40) return "快樂滿足";
  if (happiness >= 70 && calmness < 40) return "興奮活力";
  if (happiness >= 40 && calmness >= 70) return "冷靜平衡";
  if (happiness >= 40 && calmness >= 40) return "平和穩定";
  if (happiness >= 40 && calmness < 40) return "不安躁動";
  if (happiness < 40 && calmness >= 70) return "憂鬱寧靜";
  if (happiness < 40 && calmness >= 40) return "低落沮喪";
  return "焦慮煩躁";
}

export function calculateMoodDescription(happiness: number, calmness: number): string {
  const label = calculateMoodLabel(happiness, calmness);
  
  const descriptions: Record<string, string> = {
    "喜悅平靜": "您正處於幸福與寧靜的美好狀態",
    "快樂滿足": "您感到積極正面，對生活很滿意",
    "興奮活力": "您充滿熱情和活力",
    "冷靜平衡": "您的心境平和且專注",
    "平和穩定": "您感到平衡和穩定",
    "不安躁動": "您可能感到有些不安或渴望改變",
    "憂鬱寧靜": "您正經歷悲傷但內心平靜",
    "低落沮喪": "您感到溫和的悲傷或憂鬱",
    "焦慮煩躁": "您可能感到不知所措或擔憂"
  };
  
  return descriptions[label] || "您當前的情緒狀態";
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
