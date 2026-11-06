import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../store';
import { colors, radius } from '../theme/tokens';
import { Icon } from './Icon';
import { T } from './Text';

/** One global toast (seats released, booking copied, boat blocked), 2.5 s. */
export function Toast() {
  const toast = useApp((s) => s.toast);
  const hide = useApp((s) => s.showToast);
  const insets = useSafeAreaInsets();
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => hide(null), 2500);
    return () => clearTimeout(t);
  }, [toast, hide]);
  if (!toast) return null;
  return (
    <View pointerEvents="none" style={[styles.wrap, { top: insets.top + 8 }]}>
      <View style={styles.toast}>
        <Icon name="check-circle" size={18} color={colors.brass} />
        <T variant="label" style={{ color: colors.white, flexShrink: 1 }}>{toast}</T>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 20, right: 20, alignItems: 'center' },
  toast: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.accent, borderRadius: radius.pill, paddingHorizontal: 18, paddingVertical: 12 },
});
