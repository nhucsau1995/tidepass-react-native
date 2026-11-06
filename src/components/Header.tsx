import type { ReactNode } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { colors, font } from '../theme/tokens';
import { Icon, type IconName } from './Icon';
import { ScalePressable } from './Pressable';
import { T } from './Text';

export function IconButton({ icon, onPress, testID, label, color = colors.text, filled }: { icon: IconName; onPress?: () => void; testID?: string; label: string; color?: string; filled?: boolean }) {
  return (
    <ScalePressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={[{ width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' }, filled && { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }]}
    >
      <Icon name={icon} color={color} size={20} />
    </ScalePressable>
  );
}

export const goBack = () => (router.canGoBack() ? router.back() : router.replace('/explore'));

/** Centered title between a back button and an optional action, like the Stitch headers. */
export function Header({ title, subtitle, right, back = 'arrow-left', onBack, testID }: { title: string; subtitle?: string; right?: ReactNode; back?: IconName; onBack?: () => void; testID?: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <IconButton icon={back} label="Back" testID={testID ?? 'back'} filled onPress={onBack ?? goBack} />
      <View style={{ flex: 1, alignItems: 'center' }}>
        <T variant="title" numberOfLines={1}>{title}</T>
        {subtitle ? <T variant="caption">{subtitle}</T> : null}
      </View>
      <View style={{ width: 44, alignItems: 'flex-end' }}>{right}</View>
    </View>
  );
}

export function SectionTitle({ title, action, onAction, testID, overline }: { title: string; action?: string; onAction?: () => void; testID?: string; overline?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 24, marginBottom: 12 }}>
      <T variant={overline ? 'overline' : 'title'}>{title}</T>
      {action ? <T variant="label" testID={testID} onPress={onAction} style={{ color: colors.warningText, fontFamily: font.semibold }}>{action}</T> : null}
    </View>
  );
}
