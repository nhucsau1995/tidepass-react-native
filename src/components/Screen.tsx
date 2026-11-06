import type { ReactNode } from 'react';
import { ScrollView, View, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, space } from '../theme/tokens';

export function Screen({ children, footer, testID, contentStyle, header }: { children: ReactNode; footer?: ReactNode; header?: ReactNode; testID?: string; contentStyle?: StyleProp<ViewStyle> }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }} testID={testID}>
      {header ? <View style={{ paddingTop: insets.top + 8, paddingHorizontal: space.edge, paddingBottom: 8 }}>{header}</View> : null}
      <ScrollView contentContainerStyle={[{ paddingTop: header ? 4 : insets.top + 12, paddingHorizontal: space.edge, paddingBottom: 24 }, contentStyle]} showsVerticalScrollIndicator={false}>
        {children}
      </ScrollView>
      {footer ? <View style={{ paddingHorizontal: space.edge, paddingBottom: Math.max(insets.bottom, 16), paddingTop: 8 }}>{footer}</View> : null}
    </View>
  );
}
