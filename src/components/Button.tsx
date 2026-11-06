import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors, font, radius } from '../theme/tokens';
import { Icon, type IconName } from './Icon';
import { ScalePressable } from './Pressable';
import { T } from './Text';

type Kind = 'primary' | 'secondary' | 'danger' | 'dangerOutline' | 'ghost';

// Primary: graphite pill, white label. Secondary: 1.5px graphite outline. Danger: red fill.
export function Button({ label, onPress, kind = 'primary', icon, trailing, disabled, testID, style, small }: {
  label: string;
  onPress?: () => void;
  kind?: Kind;
  icon?: IconName;
  trailing?: IconName;
  disabled?: boolean;
  testID?: string;
  style?: StyleProp<ViewStyle>;
  small?: boolean;
}) {
  const fg = disabled ? colors.text3 : kind === 'primary' || kind === 'danger' ? colors.white : kind === 'dangerOutline' ? colors.danger : colors.accent;
  return (
    <ScalePressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      containerStyle={style}
      style={[styles.base, small && styles.small, styles[kind], disabled && styles.disabled]}
    >
      <View style={styles.row}>
        {icon ? <Icon name={icon} size={small ? 16 : 18} color={fg} /> : null}
        <T variant={small ? 'label' : 'body'} style={{ color: fg, fontFamily: font.semibold }}>{label}</T>
        {trailing ? <Icon name={trailing} size={small ? 16 : 18} color={fg} /> : null}
      </View>
    </ScalePressable>
  );
}

const styles = StyleSheet.create({
  base: { height: 56, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  small: { height: 44, paddingHorizontal: 18 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  primary: { backgroundColor: colors.accent },
  secondary: { backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.accent },
  danger: { backgroundColor: colors.danger },
  dangerOutline: { backgroundColor: 'transparent' },
  ghost: { backgroundColor: 'transparent' },
  disabled: { backgroundColor: colors.disabled, borderWidth: 0 },
});
