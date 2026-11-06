import Feather from '@expo/vector-icons/Feather';
import type { ComponentProps } from 'react';
import { colors } from '../theme/tokens';

// One icon set from DESIGN.md: rounded outline, Lucide style (Feather).
export type IconName = ComponentProps<typeof Feather>['name'];

export function Icon({ name, size = 24, color = colors.text }: { name: IconName; size?: number; color?: string }) {
  return <Feather name={name} size={size} color={color} />;
}
