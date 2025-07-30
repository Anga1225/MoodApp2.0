export interface MoodColor {
  hex: string;
  hsl: string;
  hue: number;
  saturation: number;
  lightness: number;
}

export function calculateMoodColor(happiness: number, calmness: number): MoodColor {
  // Normalize values to 0-1 range
  const h = happiness / 100;
  const c = calmness / 100;
  
  // Calculate hue based on mood quadrant
  let hue: number;
  if (h >= 0.5 && c >= 0.5) {
    // Happy & Calm - Green to Blue range
    hue = 120 + (h - 0.5) * 120; // 120-180 degrees
  } else if (h >= 0.5 && c < 0.5) {
    // Happy & Energetic - Yellow to Orange range
    hue = 30 + (1 - c) * 30; // 30-60 degrees
  } else if (h < 0.5 && c >= 0.5) {
    // Sad & Calm - Blue to Purple range
    hue = 200 + c * 60; // 200-260 degrees
  } else {
    // Sad & Anxious - Red to Orange range
    hue = 0 + h * 30; // 0-30 degrees
  }
  
  // Calculate saturation based on intensity
  const intensity = Math.abs(h - 0.5) + Math.abs(c - 0.5);
  const saturation = Math.min(90, 40 + intensity * 100); // 40-90%
  
  // Calculate lightness based on overall mood
  const overallMood = (h + c) / 2;
  const lightness = 45 + overallMood * 30; // 45-75%
  
  // Convert HSL to Hex
  const hex = hslToHex(hue, saturation, lightness);
  const hsl = `hsl(${Math.round(hue)}, ${Math.round(saturation)}%, ${Math.round(lightness)}%)`;
  
  return {
    hex,
    hsl,
    hue: Math.round(hue),
    saturation: Math.round(saturation),
    lightness: Math.round(lightness)
  };
}

function hslToHex(h: number, s: number, l: number): string {
  h = h % 360;
  s = s / 100;
  l = l / 100;
  
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = l - c / 2;
  
  let r = 0, g = 0, b = 0;
  
  if (0 <= h && h < 60) {
    r = c; g = x; b = 0;
  } else if (60 <= h && h < 120) {
    r = x; g = c; b = 0;
  } else if (120 <= h && h < 180) {
    r = 0; g = c; b = x;
  } else if (180 <= h && h < 240) {
    r = 0; g = x; b = c;
  } else if (240 <= h && h < 300) {
    r = x; g = 0; b = c;
  } else if (300 <= h && h < 360) {
    r = c; g = 0; b = x;
  }
  
  r = Math.round((r + m) * 255);
  g = Math.round((g + m) * 255);
  b = Math.round((b + m) * 255);
  
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

export function generateGradientFromMood(happiness: number, calmness: number): string {
  const primaryColor = calculateMoodColor(happiness, calmness);
  
  // Create a complementary color for gradient
  const complementaryHue = (primaryColor.hue + 30) % 360;
  const complementaryColor = calculateMoodColor(
    Math.min(100, happiness + 10),
    Math.min(100, calmness + 10)
  );
  
  return `linear-gradient(135deg, ${primaryColor.hex} 0%, ${complementaryColor.hex} 100%)`;
}

export function getMoodColorPalette(entries: Array<{ happiness: number; calmness: number }>): MoodColor[] {
  if (entries.length === 0) return [];
  
  return entries.slice(0, 10).map(entry => 
    calculateMoodColor(entry.happiness, entry.calmness)
  );
}
