import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import { Button } from '../components/Button';
import { Card, Sheet, Tag, Thumb } from '../components/Card';
import { Header, IconButton } from '../components/Header';
import { Icon } from '../components/Icon';
import { LivePill, useSecond } from '../components/Live';
import { T } from '../components/Text';
import { BOATS, USER, boatById, destById } from '../data/seed';
import { addDays, fmtDay, mmss, money } from '../logic/dates';
import { HOLD_MS, seatsLeft, type Departure } from '../logic/inventory';
import { useApp } from '../store';
import { slotsFor } from '../store/select';
import { colors, font, radius } from '../theme/tokens';

function Ring({ fraction, label }: { fraction: number; label: string }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  return (
    <View style={{ width: 128, height: 128, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={128} height={128} style={StyleSheet.absoluteFill}>
        <Circle cx={64} cy={64} r={r} stroke={colors.surfaceAlt} strokeWidth={8} fill="none" />
        <Circle cx={64} cy={64} r={r} stroke={colors.brass} strokeWidth={8} fill="none" strokeLinecap="round" strokeDasharray={`${c} ${c}`} strokeDashoffset={c * (1 - fraction)} transform="rotate(-90 64 64)" />
      </Svg>
      <T variant="display" testID="countdown" style={{ fontSize: 30 }}>{label}</T>
      <T variant="overline" style={{ fontSize: 12 }}>Remaining</T>
    </View>
  );
}

type Alt = { dep: Departure; left: number; note: string; best?: boolean };

// 09 Checkout with the seat hold countdown (focal) + 10 last-seat race sheet over the dimmed screen.
export default function Checkout() {
  const insets = useSafeAreaInsets();
  const inv = useApp((s) => s.inv);
  const holdId = useApp((s) => s.holdId);
  const race = useApp((s) => s.race);
  const party = useApp((s) => s.party);
  const { pay, holdSeats, dismissRace, releaseHold, expire, showToast } = useApp.getState();
  useSecond(); // re-render every second for the countdown
  const h = holdId ? inv.holds[holdId] : undefined;
  const depId = h?.departureId ?? race?.departureId;
  const dep = depId ? inv.departures[depId] : undefined;
  const [alt, setAlt] = useState(0);
  const remaining = h ? h.expiresAt - Date.now() : 0;
  const expired = !!h && remaining <= 0;

  useEffect(() => {
    if (expired) {
      expire();
      showToast(`Hold expired, ${h?.seats} seats released to other guests`);
    }
  }, [expired]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!dep) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 16, backgroundColor: colors.bg }}>
        <T variant="serif">Your hold has ended</T>
        <T variant="body" style={{ color: colors.text2, textAlign: 'center' }}>The seats went back on sale. Pick a departure again to hold fresh seats.</T>
        <Button label="Back to calendar" onPress={() => router.back()} />
      </View>
    );
  }

  const boat = boatById(dep.boatId);
  const seats = h?.seats ?? race?.seats ?? party.adults + party.children;
  const total = seats * dep.pricePerGuest;

  // Live alternatives when the race is lost: other slots that day, same slot tomorrow, a similar boat.
  const alts: Alt[] = [];
  if (race) {
    for (const s of slotsFor(inv, boat.id, dep.date)) if (s.dep.id !== dep.id && s.left >= seats) alts.push({ ...s, note: `${fmtDay(dep.date)} · ${boat.location.split(',')[1]?.trim() ?? ''} passage` });
    for (const s of slotsFor(inv, boat.id, addDays(dep.date, 1))) if (s.dep.time === dep.time && s.left >= seats) alts.push({ ...s, note: `${fmtDay(s.dep.date)} · Tomorrow` });
    const similar = BOATS.find((b) => b.id !== boat.id && b.destinationId === boat.destinationId && b.type === boat.type);
    if (similar) for (const s of slotsFor(inv, similar.id, dep.date)) if (s.left >= seats) alts.push({ ...s, note: `${fmtDay(dep.date)} ${s.dep.time} · Same slot` });
    if (alts[0]) alts[0].best = true;
  }
  const chosen = alts[Math.min(alt, alts.length - 1)];

  const onPay = (payment: 'approved' | 'declined') => {
    const r = pay(payment);
    if (r.ok) router.replace(`/confirmed/${r.id}`);
    else {
      showToast(r.reason === 'PAYMENT_DECLINED' ? `Card declined. Your ${seats} seats were released.` : 'Hold expired, seats released');
      router.back();
    }
  };
  const leave = () => {
    releaseHold();
    dismissRace();
    router.back();
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={{ paddingTop: insets.top + 6, paddingHorizontal: 20, paddingBottom: 8 }}>
        <Header title="Checkout" onBack={leave} right={<IconButton icon="help-circle" label="Help" />} />
      </View>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
        <Card style={{ alignItems: 'center', padding: 20, gap: 10 }}>
          <LivePill base={12} />
          <Ring fraction={h ? Math.max(0, remaining) / HOLD_MS : 0} label={mmss(h ? remaining : 0)} />
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <T variant="label" style={{ fontFamily: font.semibold }}>{h ? 'Seats held for you' : 'Hold not placed'}</T>
            <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: colors.brass }} />
            <T variant="label" num style={{ color: colors.text2 }}>{seats} reserved</T>
          </View>
        </Card>

        <Card style={{ padding: 16, marginTop: 16 }}>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Thumb image={boat.image} size={68} />
            <View style={{ flex: 1, gap: 2 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                <T variant="title" style={{ fontFamily: font.display, flexShrink: 1 }} numberOfLines={1}>{boat.name.split(' - ')[0]}</T>
                <Tag label={`${seats} seats held`} tone="brass" />
              </View>
              <T variant="caption">{destById(boat.destinationId)?.name ?? boat.location} · {fmtDay(dep.date)}</T>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Icon name="clock" size={13} color={colors.text2} />
                <T variant="caption" testID="checkout-slot">{dep.time} {dep.label} · {seats} guests</T>
              </View>
            </View>
          </View>
          <View style={styles.hr} />
          <View style={styles.line}><T variant="label" style={{ color: colors.text2 }}>Passage charter ({seats} × {money(dep.pricePerGuest)})</T><T variant="label" num>{money(total)}</T></View>
          <View style={styles.line}><T variant="label" style={{ color: colors.text2 }}>Marine park and wharfage levy</T><T variant="label" num>Included</T></View>
          <View style={[styles.line, { marginTop: 8 }]}>
            <T variant="label" style={{ fontFamily: font.semibold }}>Total amount due</T>
            <T variant="title" num style={{ fontFamily: font.bold }}>{money(total)}</T>
          </View>
        </Card>

        <T variant="title" style={{ marginTop: 22, marginBottom: 10 }}>Lead guest</T>
        <Card style={{ padding: 16, gap: 6 }}>
          <T variant="caption" style={{ fontFamily: font.semibold }}>Full legal name</T>
          <TextInput defaultValue={USER.name} style={styles.input} />
          <T variant="caption" style={{ fontFamily: font.semibold, marginTop: 6 }}>Mobile contact</T>
          <TextInput defaultValue={USER.phone} keyboardType="phone-pad" style={styles.input} />
          <T variant="caption" style={{ color: colors.text3 }}>Used for boarding notifications and skipper SMS updates.</T>
        </Card>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 22, marginBottom: 10 }}>
          <T variant="title">Payment method</T>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}><Icon name="lock" size={13} color={colors.warningText} /><T variant="caption" style={{ color: colors.warningText }}>Encrypted</T></View>
        </View>
        <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16 }}>
          <View style={[styles.radio]}><View style={styles.radioDot} /></View>
          <View style={styles.visa}><T variant="caption" style={{ color: colors.white, fontFamily: font.bold, fontSize: 12 }}>VISA</T></View>
          <View style={{ flex: 1 }}>
            <T variant="label" style={{ fontFamily: font.semibold }}>Visa ending 4242</T>
            <T variant="caption">Expires 08/28</T>
          </View>
          <T variant="caption" testID="pay-declined" onPress={() => onPay('declined')} style={{ color: colors.text2, textDecorationLine: 'underline' }}>Test decline</T>
        </Card>
        <View style={styles.note}>
          <Icon name="clock" size={16} color={colors.accent} />
          <T variant="caption" style={{ flex: 1, color: colors.accent }}>If payment fails or the timer ends, your seats are released to other guests.</T>
        </View>
      </ScrollView>

      <View style={[styles.foot, { paddingBottom: Math.max(insets.bottom, 12) + 4 }]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <View>
            <T variant="overline" style={{ fontSize: 12 }}>Total due</T>
            <T variant="title" num style={{ fontFamily: font.bold, fontSize: 22 }}>{money(total)}</T>
          </View>
          <Tag label="256-bit encrypted" icon="shield" />
        </View>
        <Button testID="pay" label={`Pay ${money(total)}`} trailing="arrow-right" disabled={!h || expired} onPress={() => onPay('approved')} />
      </View>

      <Sheet visible={!!race} testID="race-sheet" onClose={leave}>
        <View style={{ alignItems: 'center', gap: 8 }}>
          <View style={styles.warn}><Icon name="alert-triangle" size={22} color={colors.warning} /></View>
          <T variant="serif" style={{ textAlign: 'center' }}>No seats available</T>
          <T variant="label" style={{ textAlign: 'center', color: colors.text2 }}>
            Someone just booked the last seats on the <T variant="label" style={{ fontFamily: font.semibold, color: colors.text }}>{dep.time} {dep.label}</T> departure. You were not charged.
          </T>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, marginBottom: 10 }}>
          <T variant="label" style={{ fontFamily: font.semibold }}>Still available right now</T>
          <LivePill base={6} />
        </View>
        {alts.slice(0, 3).map((a, i) => {
          const b = boatById(a.dep.boatId);
          const sel = i === alt;
          return (
            <Pressable key={a.dep.id} testID={`alt-${i}`} onPress={() => setAlt(i)} style={[styles.alt, sel && styles.altSel]}>
              <View style={[styles.radio, sel && { borderColor: colors.accent }]}>{sel ? <View style={styles.radioDot} /> : null}</View>
              {b.id !== boat.id ? <Thumb image={b.image} size={40} r={10} /> : null}
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <T variant="label" num style={{ fontFamily: font.semibold }}>{b.id !== boat.id ? b.name : `${a.dep.time} ${a.dep.label}`}</T>
                  {a.best ? <Tag label="Best match" tone="neutral" /> : null}
                </View>
                <T variant="caption" numberOfLines={1}>{a.note}</T>
              </View>
              <View style={{ alignItems: 'flex-end', gap: 2 }}>
                <Tag label={`${seatsLeft(inv, a.dep.id)} seats left`} tone="brass" />
                <T variant="caption" num style={{ color: colors.text, fontFamily: font.semibold }}>{money(a.dep.pricePerGuest)}/guest</T>
              </View>
            </Pressable>
          );
        })}
        {chosen ? (
          <Button testID="book-alt" label={`Book ${chosen.dep.boatId === boat.id && chosen.dep.date === dep.date ? chosen.dep.time : boatById(chosen.dep.boatId).name.split(' - ')[0]} instead`} trailing="arrow-right" onPress={() => holdSeats(chosen.dep.id)} style={{ marginTop: 8 }} />
        ) : null}
        <T variant="label" testID="back-to-calendar" onPress={leave} style={{ textAlign: 'center', paddingVertical: 14, color: colors.text2 }}>Back to calendar</T>
      </Sheet>
    </View>
  );
}

const styles = StyleSheet.create({
  hr: { height: 1, backgroundColor: colors.border, marginVertical: 12 },
  line: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 3 },
  input: { height: 48, borderRadius: radius.input, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 12, fontFamily: font.regular, fontSize: 16, color: colors.text },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.accent },
  visa: { backgroundColor: '#1A1F71', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 },
  note: { flexDirection: 'row', gap: 10, alignItems: 'center', backgroundColor: colors.brassTint, borderRadius: 14, padding: 14, marginTop: 14 },
  foot: { paddingHorizontal: 20, paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.surface },
  warn: { width: 52, height: 52, borderRadius: 26, backgroundColor: colors.warningTint, alignItems: 'center', justifyContent: 'center' },
  alt: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 12, marginBottom: 8 },
  altSel: { borderColor: colors.brass, borderWidth: 2 },
});
