import { Pressable, StyleSheet, View } from 'react-native';
import { colors, font, radius } from '../theme/tokens';
import { T } from './Text';

export function Toggle({ value, onChange, testID, label }: { value: boolean; onChange: (v: boolean) => void; testID?: string; label: string }) {
  return (
    <Pressable testID={testID} accessibilityRole="switch" accessibilityLabel={label} accessibilityState={{ checked: value }} onPress={() => onChange(!value)} hitSlop={8}>
      <View style={[styles.track, { backgroundColor: value ? colors.accent : colors.border }]}>
        <View style={[styles.knob, { alignSelf: value ? 'flex-end' : 'flex-start', backgroundColor: value ? colors.brass : colors.white }]} />
      </View>
    </Pressable>
  );
}

export function Segmented<V extends string>({ options, value, onChange, testPrefix }: { options: readonly V[]; value: V; onChange: (v: V) => void; testPrefix: string }) {
  return (
    <View style={styles.seg}>
      {options.map((o) => {
        const on = o === value;
        return (
          <Pressable key={o} testID={`${testPrefix}-${o}`} accessibilityRole="button" accessibilityState={{ selected: on }} onPress={() => onChange(o)} style={[styles.segItem, on && { backgroundColor: colors.accent }]}>
            <T variant="label" style={{ color: on ? colors.white : colors.text2, fontFamily: on ? font.semibold : font.medium }}>{o}</T>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: { width: 52, height: 30, borderRadius: radius.pill, padding: 3 },
  knob: { width: 24, height: 24, borderRadius: 12, backgroundColor: colors.white },
  seg: { flexDirection: 'row', backgroundColor: colors.surfaceAlt, borderRadius: radius.pill, padding: 4, gap: 4 },
  segItem: { flex: 1, height: 40, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
});
