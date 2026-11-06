import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Image, ImageBackground, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { images, logoMarkWhite } from '../data/images';
import { PulseDot } from '../components/Live';
import { ScalePressable } from '../components/Pressable';
import { Icon } from '../components/Icon';
import { T } from '../components/Text';
import { colors, font, radius } from '../theme/tokens';

// 01 Onboarding: full-bleed charter photo, graphite fade, white primary on the photo.
export default function Onboarding() {
  const insets = useSafeAreaInsets();
  return (
    <ImageBackground source={images.heroOnboarding} style={{ flex: 1 }} resizeMode="cover">
      <StatusBar style="light" />
      <LinearGradient colors={['rgba(24,22,20,0.35)', 'rgba(24,22,20,0)', 'rgba(24,22,20,0.55)', 'rgba(24,22,20,0.92)']} locations={[0, 0.25, 0.55, 1]} style={StyleSheet.absoluteFill} />
      <View style={[styles.top, { paddingTop: insets.top + 12 }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Image source={logoMarkWhite} style={{ width: 22, height: 28 }} resizeMode="contain" />
          <T variant="title" style={{ color: colors.white, fontFamily: font.display, fontSize: 22 }}>Tidepass</T>
        </View>
        <T variant="label" testID="skip" onPress={() => router.push('/sign-in')} style={{ color: colors.white }}>Skip</T>
      </View>
      <View style={[styles.bottom, { paddingBottom: Math.max(insets.bottom, 16) + 8 }]}>
        <View style={styles.badge}>
          <PulseDot size={6} />
          <T variant="overline" style={{ color: colors.white, fontSize: 12 }}>Live Pacific charters</T>
        </View>
        <T variant="hero" style={{ color: colors.white, fontSize: 38, lineHeight: 44 }}>Book the boat.{'\n'}See it live.</T>
        <T variant="body" style={{ color: 'rgba(255,255,255,0.88)' }}>Real-time availability from 400+ operators across Asia Pacific.</T>
        <View style={{ flexDirection: 'row', gap: 6, marginVertical: 8 }}>
          <View style={[styles.dot, { width: 22, backgroundColor: colors.brass }]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>
        <ScalePressable testID="get-started" accessibilityRole="button" accessibilityLabel="Get started" onPress={() => router.push('/sign-in')} style={styles.cta}>
          <T variant="body" style={{ fontFamily: font.semibold, color: colors.accent }}>Get started</T>
          <Icon name="arrow-right" size={18} color={colors.accent} />
        </ScalePressable>
        <T variant="label" testID="have-account" onPress={() => router.push('/sign-in')} style={{ color: colors.white, textAlign: 'center', paddingVertical: 12 }}>I already have an account</T>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20 },
  bottom: { flex: 1, justifyContent: 'flex-end', paddingHorizontal: 20, gap: 12 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', borderRadius: radius.pill, borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)', backgroundColor: 'rgba(24,22,20,0.35)', paddingLeft: 6, paddingRight: 12, paddingVertical: 4 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.5)' },
  cta: { height: 56, borderRadius: radius.pill, backgroundColor: colors.white, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
});
