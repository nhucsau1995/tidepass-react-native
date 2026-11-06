import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Image, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../../components/Button';
import { Card, Tag } from '../../components/Card';
import { IconButton } from '../../components/Header';
import { Icon, type IconName } from '../../components/Icon';
import { T } from '../../components/Text';
import { images } from '../../data/images';
import { USER, boatById, meetingPoint } from '../../data/seed';
import { fmtDay } from '../../logic/dates';
import { useApp } from '../../store';
import { colors, font, radius } from '../../theme/tokens';

// 11 Booking confirmed: brass-to-graphite header, booking reference (focal), email + SMS sent.
export default function Confirmed() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const inv = useApp((s) => s.inv);
  const showToast = useApp((s) => s.showToast);
  const b = inv.bookings[id];
  if (!b) return null;
  const dep = inv.departures[b.departureId];
  const boat = boatById(dep.boatId);
  const done = () => router.dismissTo('/bookings');
  const rows: [IconName, string, string][] = [
    ['calendar', `${fmtDay(dep.date)} · ${dep.time} ${dep.label}`, `Duration ${dep.hours} hours · ${b.seats} guests aboard`],
    ['map-pin', meetingPoint(boat.id), boat.location],
    ['anchor', 'Skipper included · Capt. Liam Reeves', 'Master Mariner 200GT · English, French'],
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={[styles.top, { paddingTop: insets.top + 6 }]}>
        <T variant="title">Booking confirmed</T>
        <IconButton icon="x" label="Close" testID="close-confirmed" onPress={done} />
      </View>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <LinearGradient colors={['#F7EFDD', '#FFFFFF']} style={[StyleSheet.absoluteFill, { borderRadius: radius.card }]} />
          <LinearGradient colors={colors.brassToGraphite} style={styles.check}>
            <Icon name="check" size={28} color={colors.white} />
          </LinearGradient>
          <T variant="hero" style={{ textAlign: 'center', marginTop: 14 }}>You are on board</T>
          <T variant="label" style={{ textAlign: 'center', color: colors.text2, marginTop: 6 }}>Your charter reservation is confirmed with <T variant="label" style={{ fontFamily: font.semibold, color: colors.text }}>{boat.operator}</T>.</T>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 14 }}>
            <Tag label={`Email sent (${USER.email.slice(0, 7)}...)`} tone="success" icon="check" />
            <Tag label={`SMS sent (${USER.phone.slice(0, 3)}...)`} tone="success" icon="check" />
          </View>
        </View>

        <Card style={{ padding: 16, marginTop: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <T variant="overline">Booking reference</T>
            <Tag label="Verified booking" tone="brass" icon="check-circle" />
          </View>
          <View style={styles.ref}>
            <T variant="title" testID="booking-ref" num style={{ fontFamily: font.bold, fontSize: 22, letterSpacing: 1, flex: 1 }}>{b.id}</T>
            <Button small kind="secondary" icon="copy" label="Copy" onPress={() => showToast(`${b.id} copied`)} />
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 }}>
            <Icon name="maximize" size={14} color={colors.text2} />
            <T variant="caption">Digital boarding pass ready at embarkation</T>
          </View>
        </Card>

        <Card style={{ marginTop: 16, overflow: 'hidden' }}>
          <View>
            <Image source={images[boat.image]} style={{ width: '100%', height: 150 }} />
            <LinearGradient colors={colors.photoFade} style={StyleSheet.absoluteFill} />
            <View style={{ position: 'absolute', left: 14, bottom: 12 }}>
              <T variant="overline" style={{ color: colors.brass, fontSize: 12 }}>{boat.type} charter</T>
              <T variant="title" style={{ color: colors.white, fontFamily: font.display }}>{boat.name.split(' - ')[0]}</T>
            </View>
          </View>
          <View style={{ padding: 16, gap: 14 }}>
            {rows.map(([icon, a, c]) => (
              <View key={a} style={{ flexDirection: 'row', gap: 12 }}>
                <View style={styles.rowIcon}><Icon name={icon} size={16} color={colors.accent} /></View>
                <View style={{ flex: 1 }}>
                  <T variant="label" style={{ fontFamily: font.semibold }}>{a}</T>
                  <T variant="caption">{c}</T>
                </View>
              </View>
            ))}
          </View>
        </Card>

        <Button testID="view-booking" label="View booking" trailing="arrow-right" onPress={() => router.replace(`/booking/${b.id}?from=confirmed`)} style={{ marginTop: 20 }} />
        <Button kind="secondary" icon="calendar" label="Add to calendar" onPress={() => showToast('Added to your calendar')} style={{ marginTop: 12 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: colors.border },
  hero: { alignItems: 'center', padding: 22, borderRadius: radius.card, borderWidth: 1, borderColor: colors.border },
  check: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
  ref: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 12, borderWidth: 1, borderColor: colors.border, borderRadius: 14, padding: 14 },
  rowIcon: { width: 36, height: 36, borderRadius: 12, backgroundColor: colors.surfaceAlt, alignItems: 'center', justifyContent: 'center' },
});
