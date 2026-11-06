import { StyleSheet, View } from 'react-native';
import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, font } from '../theme/tokens';
import { Icon, type IconName } from './Icon';
import { ScalePressable } from './Pressable';
import { T } from './Text';

// Shared nav from DESIGN.md: exactly Explore, Search, Bookings, Profile; active = graphite + brass dot.
const TABS: Record<string, { label: string; icon: IconName }> = {
  explore: { label: 'Explore', icon: 'compass' },
  search: { label: 'Search', icon: 'search' },
  bookings: { label: 'Bookings', icon: 'bookmark' },
  profile: { label: 'Profile', icon: 'user' },
};

export function TabBar({ state, navigateToTab }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      {state.routes.map((route, i) => {
        const tab = TABS[route.name];
        if (!tab) return null;
        const active = state.index === i;
        const color = active ? colors.accent : colors.text3;
        return (
          <ScalePressable
            key={route.key}
            testID={`tab-${route.name}`}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            accessibilityLabel={tab.label}
            onPress={() => !active && navigateToTab(route.key)}
            containerStyle={{ flex: 1 }}
            style={styles.item}
          >
            <Icon name={tab.icon} color={color} size={22} />
            <T variant="tab" style={{ color, fontFamily: active ? font.semibold : font.medium }}>{tab.label}</T>
            <View style={[styles.dot, { backgroundColor: active ? colors.brass : 'transparent' }]} />
          </ScalePressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 8 },
  item: { flex: 1, alignItems: 'center', gap: 3, minHeight: 52 },
  dot: { width: 5, height: 5, borderRadius: 3 },
});
