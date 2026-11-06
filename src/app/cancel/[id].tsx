import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../../components/Button';
import { Card, Chip, Tag, Thumb } from '../../components/Card';
import { Header } from '../../components/Header';
import { Icon } from '../../components/Icon';
import { PulseDot } from '../../components/Live';
import { T } from '../../components/Text';
import { USER, boatById } from '../../data/seed';
import { addDays, fmtDay, money } from '../../logic/dates';
import { useApp } from '../../store';
import { colors, font, radius } from '../../theme/tokens';

const REASONS = ['Plans changed', 'Weather', 'Found another boat', 'Other'];

// 15 Cancel booking: refund breakdown (focal), reason, seats return to sale instantly.
export default function CancelBooking() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const inv = useApp((s) => s.inv);
  const { cancelBooking, showToast } = useApp.getState();
  const [reason, setReason] = useState(REASONS[0]);
  const b = inv.bookings[id];
  if (!b) return null;
  const dep = inv.departures[b.departureId];
  const boat = boatById(dep.boatId);

  const onCancel = () => {
    const seats = cancelBooking(b.id);
    showToast(`Cancelled. ${seats} seats are back on sale.`);
    router.dismissTo('/bookings');
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={{ paddingTop: insets.top + 6, paddingHorizontal: 20, paddingBottom: 8 }}>
        <Header title="Tidepass" back="x" testID="close-cancel" />
      </View>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
        <T variant="hero" style={{ marginTop: 8 }}>Cancel this booking?</T>
        <T variant="label" style={{ color: colors.text2, marginTop: 6 }}>Review refund details and confirm cancellation for your upcoming charter.</T>

        <Card style={{ flexDirection: 'row', gap: 12, padding: 14, marginTop: 18 }}>
          <Thumb image={boat.image} size={64} />
          <View style={{ flex: 1, gap: 2 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <T variant="label" style={{ fontFamily: font.display, fontSize: 17 }}>{boat.name.split(' - ')[0]}</T>
              <Tag label={b.id} />
            </View>
            <T variant="caption" num>{fmtDay(dep.date)} · {dep.time} · <T variant="caption" style={{ color: colors.warningText }}>{b.seats} guests</T></T>
            <T variant="caption">{boat.location}</T>
          </View>
        </Card>

        <Card style={{ padding: 16, marginTop: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Icon name="shield" size={18} color={colors.successText} />
              <T variant="overline" style={{ color: colors.successText }}>Eligible for full refund</T>
            </View>
            <Tag label="100% guaranteed" tone="brass" />
          </View>
          <T variant="overline" style={{ marginTop: 14, fontSize: 12 }}>Refund calculation</T>
          <T variant="display" num>{money(b.total)}</T>
          <T variant="caption">Full refund of {money(b.total)} to {USER.card} within 3-5 business days.</T>
          <View style={styles.breakdown}>
            <View style={styles.line}><T variant="caption">Charter fare ({b.seats} × {money(dep.pricePerGuest)})</T><T variant="caption" num style={{ color: colors.text }}>{money(b.total)}</T></View>
            <View style={styles.line}><T variant="caption">Marine park levy</T><T variant="caption" style={{ color: colors.text }}>Included</T></View>
            <View style={styles.line}><T variant="caption">Cancellation fee (before {fmtDay(addDays(dep.date, -2))})</T><T variant="caption" style={{ color: colors.successText, fontFamily: font.semibold }}>A$0</T></View>
          </View>
        </Card>

        <T variant="label" style={{ fontFamily: font.semibold, marginTop: 20, marginBottom: 10 }}>Reason for cancellation <T variant="caption">(optional)</T></T>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {REASONS.map((r) => <Chip key={r} label={r} selected={r === reason} onPress={() => setReason(r)} />)}
        </View>

        <View style={styles.info}>
          <PulseDot size={6} />
          <T variant="label" style={{ flex: 1 }}>Your {b.seats} seats go back on sale instantly</T>
        </View>
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
          <Icon name="info" size={14} color={colors.text3} />
          <T variant="caption" style={{ flex: 1, color: colors.text3 }}>Free cancellation policy active (more than 48 hours before departure). No penalties applied.</T>
        </View>
      </ScrollView>
      <View style={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: Math.max(insets.bottom, 12) + 4, gap: 10 }}>
        <Button testID="confirm-cancel" kind="danger" icon="x-circle" label="Cancel booking" onPress={onCancel} />
        <Button testID="keep-booking" kind="secondary" label="Keep booking" onPress={() => router.back()} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  breakdown: { marginTop: 12, backgroundColor: colors.surfaceAlt, borderRadius: radius.control, padding: 12, gap: 8 },
  line: { flexDirection: 'row', justifyContent: 'space-between' },
  info: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 20, borderWidth: 1, borderColor: colors.border, borderRadius: 14, padding: 12, backgroundColor: colors.surface },
});
