import { type CSSProperties } from 'react';

interface MedicalIconProps {
  name: string;
  className?: string;
  style?: CSSProperties;
  size?: number;
}

// Maps semantic medical icon names to Material Symbols glyphs.
const ICON_MAP: Record<string, string> = {
  spine: 'accessibility_new',
  shoulder: 'back_hand',
  knee: 'sports_kabaddi',
  dumbbell: 'fitness_center',
  activity: 'monitor_heart',
  clipboard: 'assignment',
  heart: 'favorite',
  elbow: 'back_hand',
  hip: 'rotate_right',
  ankle: 'footprint',
  cervical: 'psychology',
  exercise: 'self_improvement',
  gymnastics: 'sports_gymnastics',
  progress: 'monitoring',
  analytics: 'analytics',
  walk: 'directions_walk',
  run: 'directions_run',
  tools: 'build',
  scapula: 'sports_martial_arts',
  lumbar: 'airline_seat_recline_normal',
  core: 'shield',
  posture: 'person_outline',
  stretch: 'airline_seat_legroom_extra',
  mobility: 'rotate_left',
  balance: 'explore',
  proprioception: 'radar',
  cardio: 'cardiology',
  wrist: 'pan_tool',
  hand: 'front_hand',
  goniometer: 'straighten',
  telemetry: 'speed',
  pain: 'healing',
  target: 'adjust',
  check: 'check_circle',
};

export function MedicalIcon({ name, className = '', style, size }: MedicalIconProps) {
  const glyph = ICON_MAP[name] ?? 'medical_information';
  return (
    <span
      className={`material-symbols-outlined ${className}`}
      style={{
        fontVariationSettings: `'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24`,
        fontSize: size ? `${size}px` : undefined,
        ...style,
      }}
    >
      {glyph}
    </span>
  );
}
