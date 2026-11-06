import { Tabs } from 'expo-router';
import { TabBar } from '../../components/TabBar';
import { colors } from '../../theme/tokens';

export default function TabsLayout() {
  return (
    <Tabs tabBar={(props) => <TabBar {...props} />} screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: colors.bg }, animation: 'shift' }}>
      <Tabs.Screen name="explore" />
      <Tabs.Screen name="search" />
      <Tabs.Screen name="bookings" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
