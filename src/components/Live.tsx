import { useEffect, useRef, useSyncExternalStore } from 'react';
import { Animated, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors, font, radius } from '../theme/tokens';
import { Icon } from './Icon';
import { T } from './Text';

// One shared 1 s clock for every "synced Ns ago" caption and countdown.
let second = 0;
const subs = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | null = null;
function subscribe(cb: () => void) {
  subs.add(cb);
  if (!timer) timer = setInterval(() => { second++; subs.forEach((f) => f()); }, 1000);
  return () => {
    subs.delete(cb);
    if (!subs.size && timer) { clearInterval(timer); timer = null; }
  };
}
export const useSecond = () => useSyncExternalStore(subscribe, () => second);

/** Seconds since the last feed sync: the feed re-syncs every `period` seconds. */
export const useSyncedAgo = (base: number, period = 15) => (base + useSecond()) % period;

export function PulseDot({ color = colors.success, size = 8 }: { color?: string; size?: number }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(Animated.sequence([Animated.timing(v, { toValue: 1, duration: 900, useNativeDriver: true }), Animated.timing(v, { toValue: 0, duration: 900, useNativeDriver: true })]));
    loop.start();
    return () => loop.stop();
  }, [v]);
  return (
    <View style={{ width: size * 2, height: size * 2, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View style={{ position: 'absolute', width: size * 2, height: size * 2, borderRadius: size, backgroundColor: color, opacity: v.interpolate({ inputRange: [0, 1], outputRange: [0.25, 0] }), transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1.2] }) }] }} />
      <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color }} />
    </View>
  );
}

/** Live availability pill: pulsing green dot, 'Live' and a 'synced Ns ago' caption. */
export function LivePill({ from, base = 12, style, label }: { from?: string; base?: number; style?: StyleProp<ViewStyle>; label?: string }) {
  const ago = useSyncedAgo(base);
  return (
    <View style={[styles.pill, style]}>
      <PulseDot size={7} />
      <T variant="caption" style={{ color: colors.text, fontFamily: font.semibold }}>{label ?? 'Live'}</T>
      <T variant="caption" num style={{ color: colors.text2 }}>{from ? `synced from ${from} ${ago}s ago` : `synced ${ago}s ago`}</T>
    </View>
  );
}

export function SeatsChip({ left, guests = 1, style }: { left: number; guests?: number; style?: StyleProp<ViewStyle> }) {
  const sold = left === 0;
  const short = !sold && left < guests;
  const last = !sold && !short && left <= 2;
  const text = sold ? 'Sold out' : short ? `Only ${left} left` : last ? (left === 1 ? 'Last seat' : 'Last seats') : `${left} seats left`;
  return (
    <View style={[styles.seats, { backgroundColor: last ? colors.brass : sold || short ? colors.surfaceAlt : colors.brassTint }, style]}>
      {!sold ? <Icon name="users" size={13} color={colors.accent} /> : null}
      <T variant="caption" num style={{ color: sold || short ? colors.text2 : colors.accent, fontFamily: font.semibold }}>{text}</T>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', backgroundColor: colors.surface, borderRadius: radius.pill, paddingLeft: 4, paddingRight: 10, paddingVertical: 2, borderWidth: 1, borderColor: colors.border },
  seats: { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 5, alignSelf: 'flex-start' },
});
