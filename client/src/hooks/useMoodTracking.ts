import { useState, useCallback, useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { calculateMoodColor, generateGradientFromMood } from '@/utils/colorAlgorithms';
import { calculateMoodLabel, calculateMoodDescription, moodPresets } from '@/utils/moodCalculations';
import type { MoodEntry, InsertMoodEntry } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';

export function useMoodTracking() {
  const [happiness, setHappiness] = useState(75);
  const [calmness, setCalmness] = useState(60);
  const [notes, setNotes] = useState('');
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Calculate current mood state
  const currentMood = useMemo(() => {
    const color = calculateMoodColor(happiness, calmness);
    const label = calculateMoodLabel(happiness, calmness);
    const description = calculateMoodDescription(happiness, calmness);
    const gradient = generateGradientFromMood(happiness, calmness);
    
    return {
      happiness,
      calmness,
      color,
      label,
      description,
      gradient
    };
  }, [happiness, calmness]);

  // Debounced mood update
  const updateMood = useCallback((newHappiness?: number, newCalmness?: number) => {
    if (newHappiness !== undefined) setHappiness(newHappiness);
    if (newCalmness !== undefined) setCalmness(newCalmness);
  }, []);

  // Quick mood selection
  const selectQuickMood = useCallback((moodType: keyof typeof moodPresets) => {
    const preset = moodPresets[moodType];
    setHappiness(preset.happiness);
    setCalmness(preset.calmness);
  }, []);

  // Save mood entry mutation
  const saveMoodMutation = useMutation({
    mutationFn: async (data: Partial<InsertMoodEntry>) => {
      const color = calculateMoodColor(happiness, calmness);
      const entryData: InsertMoodEntry = {
        happiness,
        calmness,
        colorHex: color.hex,
        colorHsl: color.hsl,
        hue: color.hue,
        saturation: color.saturation,
        lightness: color.lightness,
        notes: notes || undefined,
        userId: undefined, // For MVP, not using user auth
        quickMood: data.quickMood || undefined,
        isAnonymous: data.isAnonymous || 0,
        country: undefined,
        city: undefined,
        ...data
      };
      
      const response = await apiRequest('POST', '/api/mood/entries', entryData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/mood/entries'] });
      queryClient.invalidateQueries({ predicate: (query) => 
        Boolean(query.queryKey[0]?.toString().startsWith('/api/mood/entries'))
      });
      queryClient.invalidateQueries({ queryKey: ['/api/mood/analytics/trends'] });
      toast({
        title: "心情已記錄 ✨",
        description: "您的感受已被溫柔地保存下來",
      });
      setNotes('');
    },
    onError: () => {
      toast({
        title: "稍後再試",
        description: "現在有點忙碌，請稍後再記錄您的心情",
        variant: "destructive",
      });
    }
  });

  const saveMoodEntry = useCallback((quickMood?: string, isAnonymous = false) => {
    saveMoodMutation.mutate({ quickMood, isAnonymous: isAnonymous ? 1 : 0 });
  }, [saveMoodMutation]);

  return {
    happiness,
    calmness,
    notes,
    setNotes,
    currentMood,
    updateMood,
    selectQuickMood,
    saveMoodEntry,
    isSaving: saveMoodMutation.isPending
  };
}

export function useMoodHistory(limit = 50) {
  return useQuery<MoodEntry[]>({
    queryKey: [`/api/mood/entries?limit=${limit}`],
    staleTime: 30000, // 30 seconds
  });
}

export function useRecentMoods(limit = 10) {
  return useQuery<MoodEntry[]>({
    queryKey: [`/api/mood/entries/recent?limit=${limit}`],
    staleTime: 10000, // 10 seconds
  });
}

export function useMoodAnalytics() {
  return useQuery({
    queryKey: ['/api/mood/analytics/trends'],
    staleTime: 60000, // 1 minute
  });
}
