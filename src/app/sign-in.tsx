import { router } from 'expo-router';
import { useState } from 'react';
import { Image, StyleSheet, TextInput, View } from 'react-native';
import { Button } from '../components/Button';
import { IconButton, goBack } from '../components/Header';
import { Icon } from '../components/Icon';
import { PulseDot } from '../components/Live';
import { Screen } from '../components/Screen';
import { T } from '../components/Text';
import { images, logoMark } from '../data/images';
import { USER } from '../data/seed';
import { useApp } from '../store';
import { colors, font, radius } from '../theme/tokens';

// 02 Sign in: photo banner, email + password, social options (simulated, no OAuth).
export default function SignIn() {
  const signIn = useApp((s) => s.signIn);
  const [email, setEmail] = useState(USER.email);
  const [focus, setFocus] = useState<string | null>(null);
  const go = () => {
    signIn();
    router.replace('/explore');
  };
  return (
    <Screen
      header={
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <IconButton icon="arrow-left" label="Back" filled onPress={goBack} />
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Image source={logoMark} style={{ width: 16, height: 21 }} resizeMode="contain" />
            <T variant="title" style={{ fontFamily: font.display }}>Tidepass</T>
          </View>
          <T variant="label" style={{ color: colors.text2, width: 44, textAlign: 'right' }}>Help</T>
        </View>
      }
    >
      <View style={styles.banner}>
        <Image source={images.heroSignin} style={StyleSheet.absoluteFill} />
        <View style={styles.bannerPill}>
          <PulseDot size={6} />
          <T variant="overline" style={{ fontSize: 12, color: colors.accent }}>Charter fleet live</T>
        </View>
      </View>
      <T variant="hero" style={{ marginTop: 20 }}>Welcome aboard</T>
      <T variant="body" style={{ color: colors.text2, marginTop: 4 }}>Sign in to see your charters, live seat tracking and bookings.</T>

      <T variant="label" style={styles.label}>Email</T>
      <TextInput testID="email" value={email} onChangeText={setEmail} onFocus={() => setFocus('email')} onBlur={() => setFocus(null)} autoCapitalize="none" keyboardType="email-address" style={[styles.input, focus === 'email' && styles.focus]} />
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <T variant="label" style={styles.label}>Password</T>
        <T variant="caption" style={{ marginTop: 16, color: colors.text2 }}>Forgot password?</T>
      </View>
      <View>
        <TextInput testID="password" defaultValue="tidepass-demo" secureTextEntry onFocus={() => setFocus('pw')} onBlur={() => setFocus(null)} style={[styles.input, focus === 'pw' && styles.focus]} />
        <View style={{ position: 'absolute', right: 14, top: 15 }}><Icon name="eye" size={18} color={colors.text3} /></View>
      </View>

      <Button testID="sign-in" label="Sign in" trailing="arrow-right" onPress={go} style={{ marginTop: 24 }} />
      <View style={styles.divider}>
        <View style={styles.line} />
        <T variant="caption">or</T>
        <View style={styles.line} />
      </View>
      <Button kind="secondary" label="Continue with Apple" onPress={go} />
      <Button kind="secondary" label="Continue with Google" onPress={go} style={{ marginTop: 12 }} />
      <T variant="label" style={{ textAlign: 'center', marginTop: 20, color: colors.text2 }}>
        New to Tidepass? <T variant="label" style={{ fontFamily: font.semibold, color: colors.accent }}>Create an account</T>
      </T>
      <T variant="caption" style={{ textAlign: 'center', marginTop: 12, color: colors.text3 }}>Booking confirmations arrive by email and SMS.</T>
    </Screen>
  );
}

const styles = StyleSheet.create({
  banner: { height: 120, borderRadius: 20, overflow: 'hidden', justifyContent: 'flex-end', padding: 12, backgroundColor: colors.surfaceAlt },
  bannerPill: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', backgroundColor: colors.surface, borderRadius: radius.pill, paddingLeft: 4, paddingRight: 12, paddingVertical: 2 },
  label: { marginTop: 16, marginBottom: 8, fontFamily: font.semibold },
  input: { height: 52, borderRadius: radius.input, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, paddingHorizontal: 14, fontFamily: font.regular, fontSize: 16, color: colors.text },
  focus: { borderColor: colors.brass, borderWidth: 2 },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 16 },
  line: { flex: 1, height: 1, backgroundColor: colors.border },
});
