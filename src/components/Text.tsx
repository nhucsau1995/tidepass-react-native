import { Text as RNText, type TextProps } from 'react-native';
import { colors, font, size } from '../theme/tokens';

type Variant = 'hero' | 'display' | 'serif' | 'title' | 'body' | 'label' | 'caption' | 'overline' | 'tab';

const styles: Record<Variant, object> = {
  hero: { fontFamily: font.display, fontSize: 34, lineHeight: 40, letterSpacing: -0.6, color: colors.text },
  display: { fontFamily: font.bold, fontSize: size.display, lineHeight: 40, letterSpacing: -0.6, color: colors.text, fontVariant: ['tabular-nums'] },
  serif: { fontFamily: font.display, fontSize: 26, lineHeight: 32, letterSpacing: -0.3, color: colors.text },
  title: { fontFamily: font.semibold, fontSize: size.title, lineHeight: 28, color: colors.text },
  body: { fontFamily: font.regular, fontSize: size.body, lineHeight: 24, color: colors.text },
  label: { fontFamily: font.medium, fontSize: size.label, lineHeight: 20, color: colors.text },
  caption: { fontFamily: font.medium, fontSize: size.caption, lineHeight: 18, color: colors.text2 },
  overline: { fontFamily: font.semibold, fontSize: size.caption, lineHeight: 18, letterSpacing: 1, textTransform: 'uppercase', color: colors.text2 },
  tab: { fontFamily: font.medium, fontSize: size.tab, lineHeight: 16, color: colors.text3 },
};

export function T({ variant = 'body', bold, num, style, ...rest }: TextProps & { variant?: Variant; bold?: boolean; num?: boolean }) {
  return <RNText {...rest} style={[styles[variant], bold && { fontFamily: font.semibold }, num && { fontVariant: ['tabular-nums'] }, style]} />;
}
