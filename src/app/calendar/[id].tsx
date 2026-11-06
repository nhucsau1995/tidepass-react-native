import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../../components/Button';
import { Thumb } from '../../components/Card';
import { IconButton, goBack } from '../../components/Header';
import { Icon } from '../../components/Icon';
import { LivePill } from '../../components/Live';
import { T } from '../../components/Text';
import { DAYS_AHEAD, boatById } from '../../data/seed';
import { MONTHS_LONG, TODAY, addDays, daysBetween, fmtDay, money, monthGrid } from '../../logic/dates';
import { dayStatus } from '../../logic/inventory';
import { useApp } from '../../store';
import { slotsFor } from '../../store/select';
import { STATUS_COLOR, colors, font, radius } from '../../theme/tokens';

const MONTHS = [9, 10, 11]; // Oct-Dec 2026, inside the seeded departure window

// 08 Availability calendar: month with per-day status, departure slots with live seats, guests, hold.
export default function Calendar() {
  const { id, date } = useLocalSearchParams<{ id: string; date?: string }>();
  const boat = boatById(id) ?? boatById('lagoon380');
  const inv = useApp((s) => s.inv);
  const party = useApp((s) => s.party);
  const setParty = useApp((s) => s.setParty);
  const holdSeats = useApp((s) => s.holdSeats);
  const insets = useSafeAreaInsets();
  const guests = party.adults + party.children;
  const [day, setDay] = useState(date ?? TODAY);
  const [mi, setMi] = useState(Math.max(0, MONTHS.indexOf(Number(day.slice(5, 7)) - 1)));
  const [slotId, setSlotId] = useState<string | null>(null);
  const slots = slotsFor(inv, boat.id, day);
  const slot = slots.find((s) => s.dep.id === slotId);
  const canHold = !!slot && slot.left >= guests;
  const last = addDays(TODAY, DAYS_AHEAD);
  const grid = monthGrid(2026, MONTHS[mi]);

  const pickDay = (d: string) => {
    setDay(d);
    setSlotId(null);
  };
  const onHold = () => {
    if (!slot) return;
    holdSeats(slot.dep.id);
    router.push('/checkout');
  };
  const step = (k: 'adults' | 'children', n: number) => {
    const next = { ...party, [k]: Math.max(k === 'adults' ? 1 : 0, party[k] + n) };
    if (next.adults + next.children <= boat.specs.maxGuests) setParty(next.adults, next.children);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      <View style={[styles.head, { paddingTop: insets.top + 8 }]}>
        <Thumb image={boat.image} size={48} r={12} />
        <View style={{ flex: 1 }}>
          <T variant="overline" style={{ fontSize: 12 }}>{boat.operator}</T>
          <T variant="title">Choose a departure</T>
        </View>
        <IconButton icon="x" label="Close" testID="close-calendar" onPress={goBack} />
      </View>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
        <View style={styles.liveRow}>
          <LivePill label="Availability updates live" base={8} style={{ borderWidth: 0, backgroundColor: 'transparent' }} />
        </View>

        <View style={styles.cal}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
            <T variant="title" style={{ flex: 1 }}>{MONTHS_LONG[MONTHS[mi]]} 2026</T>
            <IconButton icon="chevron-left" label="Previous month" onPress={() => setMi(Math.max(0, mi - 1))} />
            <IconButton icon="chevron-right" label="Next month" onPress={() => setMi(Math.min(MONTHS.length - 1, mi + 1))} />
          </View>
          <View style={styles.week}>
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => <T key={i} variant="caption" style={styles.cell}>{d}</T>)}
          </View>
          <View style={styles.week}>
            {grid.map((d, i) => {
              if (!d) return <View key={i} style={styles.cell} />;
              const past = daysBetween(TODAY, d) < 0 || daysBetween(d, last) < 0;
              const st = past ? 'none' : dayStatus(inv, boat.id, d, guests);
              const sel = d === day;
              return (
                <Pressable key={d} testID={`cal-${d}`} disabled={past} onPress={() => pickDay(d)} style={styles.cell}>
                  <View style={[styles.num, sel && { backgroundColor: colors.accent }]}>
                    <T variant="label" num style={{ color: sel ? colors.white : past ? colors.border : st === 'full' ? colors.text3 : colors.text, fontFamily: sel ? font.bold : font.medium, textDecorationLine: st === 'full' && !sel ? 'line-through' : 'none' }}>{Number(d.slice(8))}</T>
                  </View>
                  <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: past || st === 'none' ? 'transparent' : STATUS_COLOR[st] }} />
                </Pressable>
              );
            })}
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 16, marginTop: 8 }}>
            {(['available', 'limited', 'full'] as const).map((k) => (
              <View key={k} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: STATUS_COLOR[k] }} />
                <T variant="caption">{k === 'available' ? 'Available' : k === 'limited' ? 'Limited' : 'Full / booked'}</T>
              </View>
            ))}
          </View>
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, marginBottom: 10 }}>
          <T variant="label" style={{ fontFamily: font.semibold }}>Available departures for {fmtDay(day)}</T>
          <T variant="caption">{slots.length} departures</T>
        </View>
        {slots.map(({ dep, left }) => {
          const full = left < guests;
          const sel = dep.id === slotId;
          const lastSeats = !full && left <= 2;
          return (
            <Pressable key={dep.id} testID={`slot-${dep.time.replace(':', '')}`} disabled={full} onPress={() => setSlotId(dep.id)} style={[styles.slot, sel && styles.slotSel, full && { opacity: 0.5 }]}>
              <View style={[styles.radio, sel && { borderColor: colors.accent }]}>{sel ? <View style={styles.radioDot} /> : null}</View>
              <View style={{ flex: 1, gap: 4 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <T variant="label" num style={{ fontFamily: font.bold }}>{dep.time} {dep.label}</T>
                  <T variant="caption" style={{ color: colors.text3 }}>{dep.hours} hours</T>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <View style={[styles.left, { backgroundColor: full ? colors.surfaceAlt : lastSeats ? colors.brass : colors.brassTint }]}>
                    <T variant="caption" num style={{ color: full ? colors.text2 : colors.accent, fontFamily: font.semibold }}>{full ? (left ? `Only ${left} left` : 'Full') : lastSeats ? `Last ${left === 1 ? 'seat' : `${left} seats`}` : `${left} of ${dep.capacity} seats left`}</T>
                  </View>
                </View>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <T variant="label" num style={{ fontFamily: font.bold }}>{money(dep.pricePerGuest)}</T>
                <T variant="caption">/guest</T>
              </View>
            </Pressable>
          );
        })}

        <View style={styles.guests}>
          {(['adults', 'children'] as const).map((k) => (
            <View key={k} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 6 }}>
              <T variant="label" style={{ flex: 1, fontFamily: font.semibold }}>{k === 'adults' ? 'Adults' : 'Children'}</T>
              <Pressable testID={`${k}-minus`} onPress={() => step(k, -1)} style={styles.step}><Icon name="minus" size={16} color={colors.accent} /></Pressable>
              <T variant="label" num style={{ width: 32, textAlign: 'center', fontFamily: font.bold }}>{party[k]}</T>
              <Pressable testID={`${k}-plus`} onPress={() => step(k, 1)} style={styles.step}><Icon name="plus" size={16} color={colors.accent} /></Pressable>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={[styles.foot, { paddingBottom: Math.max(insets.bottom, 12) + 4 }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 }}>
          <Icon name="clock" size={14} color={colors.text2} />
          <T variant="caption" style={{ flex: 1 }}>Seats held for <T variant="caption" style={{ color: colors.text, fontFamily: font.semibold }}>10:00 min</T> upon booking</T>
          <T variant="caption" num style={{ color: colors.text, fontFamily: font.semibold }}>Total {money(slot ? slot.dep.pricePerGuest * guests : 0)}</T>
        </View>
        <Button testID="hold-seats" label="Hold seats for 10:00" trailing="arrow-right" disabled={!canHold} onPress={onHold} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  liveRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, borderWidth: 1, borderColor: colors.border, borderRadius: radius.pill, paddingRight: 14, paddingVertical: 4, paddingLeft: 4 },
  cal: { marginTop: 14, borderWidth: 1, borderColor: colors.border, borderRadius: radius.card, padding: 14 },
  week: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: `${100 / 7}%`, alignItems: 'center', textAlign: 'center', paddingVertical: 2 },
  num: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  slot: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 14, marginBottom: 10, backgroundColor: colors.surface },
  slotSel: { borderColor: colors.brass, borderWidth: 2, backgroundColor: colors.brassTint },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.accent },
  left: { borderRadius: radius.pill, paddingHorizontal: 8, paddingVertical: 2 },
  guests: { marginTop: 8, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 8 },
  step: { width: 36, height: 36, borderRadius: 18, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  foot: { paddingHorizontal: 20, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.surface },
});
