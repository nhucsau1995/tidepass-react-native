import { Montserrat_400Regular, Montserrat_500Medium, Montserrat_600SemiBold, Montserrat_700Bold, useFonts } from '@expo-google-fonts/montserrat';
import { PlayfairDisplay_600SemiBold, PlayfairDisplay_700Bold } from '@expo-google-fonts/playfair-display';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { View } from 'react-native';
import { Toast } from '../components/Toast';
import { useApp } from '../store';
import { colors } from '../theme/tokens';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [loaded] = useFonts({ Montserrat_400Regular, Montserrat_500Medium, Montserrat_600SemiBold, Montserrat_700Bold, PlayfairDisplay_600SemiBold, PlayfairDisplay_700Bold });
  useEffect(() => {
    if (loaded) SplashScreen.hideAsync().catch(() => {});
  }, [loaded]);
  // Operator feeds keep syncing in the background (boats outside the demo path).
  useEffect(() => {
    const t = setInterval(() => useApp.getState().feedTick(), 30000);
    return () => clearInterval(t);
  }, []);
  if (!loaded) return null;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right', contentStyle: { backgroundColor: colors.bg } }}>
        <Stack.Screen name="index" options={{ animation: 'fade' }} />
        <Stack.Screen name="sign-in" />
        <Stack.Screen name="(tabs)" options={{ animation: 'fade', gestureEnabled: false }} />
        <Stack.Screen name="destination/[id]" />
        <Stack.Screen name="boat/[id]" />
        <Stack.Screen name="calendar/[id]" options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="checkout" />
        <Stack.Screen name="confirmed/[id]" options={{ animation: 'fade', gestureEnabled: false }} />
        <Stack.Screen name="booking/[id]" />
        <Stack.Screen name="cancel/[id]" options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="notifications" />
        <Stack.Screen name="operator" />
      </Stack>
      <Toast />
    </View>
  );
}
