import type { ReactNode } from 'react';
import { Image, Modal, Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { images, type ImageKey } from '../data/images';
import { colors, font, radius, shadow } from '../theme/tokens';
import { Icon, type IconName } from './Icon';
import { ScalePressable } from './Pressable';
import { T } from './Text';

export function Card({ children, style, testID, onPress }: { children: ReactNode; style?: StyleProp<ViewStyle>; testID?: string; onPress?: () => void }) {
  if (onPress) {
    return (
      <ScalePressable testID={testID} accessibilityRole="button" onPress={onPress} style={[styles.card, style]} scaleTo={0.985}>
        {children}
      </ScalePressable>
    );
  }
  return <View testID={testID} style={[styles.card, style]}>{children}</View>;
}

export function Chip({ label, selected, onPress, testID, icon }: { label: string; selected?: boolean; onPress?: () => void; testID?: string; icon?: IconName }) {
  return (
    <Pressable testID={testID} accessibilityRole="button" accessibilityState={{ selected: !!selected }} onPress={onPress} style={[styles.chip, selected && { backgroundColor: colors.accent }]}>
      {icon ? <Icon name={icon} size={14} color={selected ? colors.white : colors.accent} /> : null}
      <T variant="label" style={{ color: selected ? colors.white : colors.accent, fontFamily: selected ? font.semibold : font.medium }}>{label}</T>
    </Pressable>
  );
}

export function Tag({ label, tone = 'neutral', icon }: { label: string; tone?: 'neutral' | 'success' | 'warning' | 'brass' | 'danger'; icon?: IconName }) {
  const map = {
    neutral: [colors.surfaceAlt, colors.text2],
    success: [colors.successTint, colors.successText],
    warning: [colors.warningTint, colors.warningText],
    brass: [colors.brassTint, colors.accent],
    danger: [colors.dangerTint, colors.danger],
  } as const;
  const [bg, fg] = map[tone];
  return (
    <View style={[styles.tag, { backgroundColor: bg }]}>
      {icon ? <Icon name={icon} size={12} color={fg} /> : null}
      <T variant="caption" style={{ color: fg, fontFamily: font.semibold }}>{label}</T>
    </View>
  );
}

export function Thumb({ image, size = 64, r = 14 }: { image: ImageKey; size?: number; r?: number }) {
  return <Image source={images[image]} style={{ width: size, height: size, borderRadius: r, backgroundColor: colors.surfaceAlt }} />;
}

export function Row({ icon, title, sub, right, onPress, testID, danger }: { icon: IconName; title: string; sub?: string; right?: ReactNode; onPress?: () => void; testID?: string; danger?: boolean }) {
  return (
    <Pressable testID={testID} accessibilityRole="button" onPress={onPress} style={styles.row}>
      <View style={[styles.rowIcon, danger && { backgroundColor: colors.dangerTint }]}>
        <Icon name={icon} size={18} color={danger ? colors.danger : colors.accent} />
      </View>
      <View style={{ flex: 1 }}>
        <T variant="label" style={{ fontFamily: font.semibold, color: danger ? colors.danger : colors.text }}>{title}</T>
        {sub ? <T variant="caption">{sub}</T> : null}
      </View>
      {right}
      <Icon name="chevron-right" size={18} color={colors.text3} />
    </Pressable>
  );
}

/** Bottom sheet over a dimmed screen (last-seat race, confirmations). */
export function Sheet({ visible, children, onClose, testID }: { visible: boolean; children: ReactNode; onClose?: () => void; testID?: string }) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <View style={{ flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' }}>
        <View testID={testID} style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) + 8 }]}>
          <View style={styles.grabber} />
          {children}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.card, ...shadow },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, height: 40, paddingHorizontal: 16, borderRadius: radius.pill, backgroundColor: colors.surfaceAlt },
  tag: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 3 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, paddingHorizontal: 16, minHeight: 56 },
  rowIcon: { width: 36, height: 36, borderRadius: 12, backgroundColor: colors.surfaceAlt, alignItems: 'center', justifyContent: 'center' },
  sheet: { backgroundColor: colors.surface, borderTopLeftRadius: radius.sheet, borderTopRightRadius: radius.sheet, paddingHorizontal: 20, paddingTop: 10 },
  grabber: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border, marginBottom: 12 },
});
