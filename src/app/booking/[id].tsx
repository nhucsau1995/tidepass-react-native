import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Image, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../../components/Button';
import { Card, Tag } from '../../components/Card';
import { IconButton, goBack } from '../../components/Header';
import { Icon, type IconName } from '../../components/Icon';
import { LivePill } from '../../components/Live';
import { StatusTag } from '../../components/StatusTag';
import { T } from '../../components/Text';
import { images } from '../../data/images';
import { boatById, meetingPoint } from '../../data/seed';
import { addDays, dayNum, fmtDay, fmtShort, money, monthShort } from '../../logic/dates';
import { useApp } from '../../store';
import { colors, font, radius } from '../../theme/tokens';

const fmtMs = (ms: number) => {
  const d = new Date(ms).toISOString().slice(0, 10);
  return `${dayNum(d)} ${monthShort(d)}`;
};
const SESSION_START = Date.now();

// 14 Booking detail: reference, status, itinerary timeline, captain, meeting point, change / cancel.
export default function BookingDetail() {
  const { id, from } = useLocalSearchParams<{ id: string; from?: string }>();
  const insets = useSafeAreaInsets();
  const inv = useApp((s) => s.inv);
  const showToast = useApp((s) => s.showToast);
  const b = inv.bookings[id];
  if (!b) return null;
  const dep = inv.departures[b.departureId];
  const boat = boatById(dep.boatId);
  const live = b.status === 'confirmed';
  const booked = b.createdAt >= SESSION_START ? 'Just now' : fmtMs(b.createdAt);
  const steps: { icon: IconName; title: string; when: string; sub: string; done: boolean }[] = [
    { icon: 'check', title: 'Booked', when: booked, sub: 'Charter reserved via the Tidepass app', done: true },
    { icon: 'check', title: `Paid ${money(b.total)}`, when: 'Visa 4242', sub: 'Receipt sent by email and SMS', done: true },
    { icon: 'bell', title: 'Reminder', when: fmtDay(addDays(dep.date, -1)), sub: 'Check-in instructions and weather briefing', done: false },
    { icon: 'anchor', title: 'Departure', when: `${fmtShort(dep.date)} · ${dep.time}`, sub: `${dep.hours}h ${dep.label} · ${b.seats} guests · bring your boarding pass`, done: false },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView testID="booking-detail" contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        <View>
          <Image source={images[boat.image]} style={{ width: '100%', height: 260 }} />
          <LinearGradient colors={colors.photoFade} style={StyleSheet.absoluteFill} />
          <View style={[styles.bar, { top: insets.top + 6 }]}>
            <IconButton icon="arrow-left" label="Back" testID="back" filled onPress={from === 'confirmed' ? () => router.dismissTo('/bookings') : goBack} />
            <IconButton icon="heart" label="Save" filled />
          </View>
          <View style={{ position: 'absolute', left: 20, right: 20, bottom: 16, gap: 4 }}>
            <LivePill base={12} />
            <T variant="serif" style={{ color: colors.white, fontSize: 30, lineHeight: 36 }}>{boat.name}</T>
            <T variant="label" style={{ color: 'rgba(255,255,255,0.9)' }}>{boat.location}</T>
          </View>
        </View>

        <View style={{ paddingHorizontal: 20 }}>
          <Card style={{ padding: 16, marginTop: -8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <T variant="caption">Booking ref</T>
              <T variant="label" testID="detail-ref" num style={{ fontFamily: font.bold, letterSpacing: 0.5, flex: 1 }}>{b.id}</T>
              <Button small kind="secondary" icon="copy" label="Copy" onPress={() => showToast(`${b.id} copied`)} />
            </View>
            <View style={styles.hr} />
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View>
                <T variant="caption">{dep.label} charter · {b.seats} guests</T>
                <T variant="title" num>{b.status === 'confirmed' ? `Paid in full ${money(b.total)}` : `Refunded ${money(b.total)}`}</T>
              </View>
              <StatusTag b={b} />
            </View>
          </Card>

          <Card style={{ padding: 16, marginTop: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <T variant="title">Itinerary and schedule</T>
              <Tag label="4 steps" tone="brass" />
            </View>
            {steps.map((s, i) => (
              <View key={s.title} style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ alignItems: 'center' }}>
                  <View style={[styles.stepDot, s.done ? { backgroundColor: colors.accent } : { borderWidth: 2, borderColor: colors.brass, backgroundColor: colors.surface }]}>
                    <Icon name={s.icon} size={12} color={s.done ? colors.white : colors.accent} />
                  </View>
                  {i < steps.length - 1 ? <View style={styles.stepLine} /> : null}
                </View>
                <View style={[{ flex: 1, paddingBottom: 14 }, i === steps.length - 1 && styles.depBox]}>
                  <View style={{ flexDirection: 'row', gap: 8, alignItems: 'baseline' }}>
                    <T variant="label" style={{ fontFamily: font.semibold }}>{s.title}</T>
                    <T variant="caption" num>{s.when}</T>
                  </View>
                  <T variant="caption">{s.sub}</T>
                </View>
              </View>
            ))}
          </Card>

          <Card style={{ padding: 16, marginTop: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <T variant="overline">Your captain</T>
              <T variant="caption" num>★ 5.0 (84 charters)</T>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 10 }}>
              <Image source={images.captain} style={{ width: 56, height: 56, borderRadius: 28 }} />
              <View>
                <T variant="title">Captain Liam Reeves</T>
                <T variant="caption" style={{ color: colors.warningText }}>Assigned skipper</T>
                <T variant="caption">Master Mariner 200GT · 12 yrs exp</T>
              </View>
            </View>
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
              <Button small kind="secondary" icon="phone" label="Call" style={{ flex: 1 }} onPress={() => showToast('Calling is simulated in this demo')} />
              <Button small icon="message-square" label="Message" style={{ flex: 1 }} onPress={() => showToast('Message sent to the skipper')} />
            </View>
          </Card>

          <Card style={{ padding: 16, marginTop: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
              <T variant="title">Meeting point</T>
              <T variant="caption">{meetingPoint(boat.id).split(',').pop()?.trim()}</T>
            </View>
            <Image source={images.marinaMap} style={{ width: '100%', height: 130, borderRadius: 14 }} />
            <T variant="label" style={{ fontFamily: font.semibold, marginTop: 10 }}>{meetingPoint(boat.id)} · {boat.location.split(',')[0]}</T>
            <T variant="caption">Meet at the harbour master office 20 min before boarding.</T>
          </Card>

          <Card style={{ padding: 16, marginTop: 16, gap: 12 }}>
            <T variant="overline">Policies and advisory</T>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Icon name="shield" size={18} color={colors.accent} />
              <View style={{ flex: 1 }}>
                <T variant="label" style={{ fontFamily: font.semibold }}>Free cancellation</T>
                <T variant="caption">Full refund until {fmtDay(addDays(dep.date, -2))} (48 hours before departure).</T>
              </View>
            </View>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Icon name="cloud-drizzle" size={18} color={colors.accent} />
              <View style={{ flex: 1 }}>
                <T variant="label" style={{ fontFamily: font.semibold }}>Weather guarantee</T>
                <T variant="caption">If the operator cancels for weather, you are refunded in full and notified by push, email and SMS.</T>
              </View>
            </View>
          </Card>

          {live ? (
            <>
              <Button kind="secondary" label="Change date or time" onPress={() => router.push(`/calendar/${boat.id}?date=${dep.date}`)} style={{ marginTop: 20 }} />
              <T variant="label" testID="cancel-booking" onPress={() => router.push(`/cancel/${b.id}`)} style={{ color: colors.danger, textAlign: 'center', paddingVertical: 16, fontFamily: font.semibold }}>Cancel booking</T>
            </>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { position: 'absolute', left: 16, right: 16, flexDirection: 'row', justifyContent: 'space-between' },
  hr: { height: 1, backgroundColor: colors.border, marginVertical: 12 },
  stepDot: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  stepLine: { width: 2, flex: 1, backgroundColor: colors.border, marginVertical: 2 },
  depBox: { backgroundColor: colors.surfaceAlt, borderRadius: radius.control, padding: 12, paddingBottom: 12 },
});
