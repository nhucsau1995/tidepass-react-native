import { router, useLocalSearchParams } from 'expo-router';
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../../components/Button';
import { Card, Tag } from '../../components/Card';
import { IconButton, goBack } from '../../components/Header';
import { Icon, type IconName } from '../../components/Icon';
import { LivePill } from '../../components/Live';
import { T } from '../../components/Text';
import { images } from '../../data/images';
import { SOURCE_LABEL } from '../../data/models';
import { boatById, destById } from '../../data/seed';
import { TODAY, addDays, dayNum, dow, money } from '../../logic/dates';
import { dayStatus, seatsLeft, departuresFor } from '../../logic/inventory';
import { useApp } from '../../store';
import { STATUS_COLOR, colors, font, radius } from '../../theme/tokens';

// 07 Boat detail: hero photo, live feed pill, spec grid, next 7 days strip (focal), sticky price bar.
export default function BoatDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const boat = boatById(id) ?? boatById('lagoon380');
  const inv = useApp((s) => s.inv);
  const party = useApp((s) => s.party);
  const guests = party.adults + party.children;
  const insets = useSafeAreaInsets();
  const dest = destById(boat.destinationId);
  const week = Array.from({ length: 7 }, (_, i) => addDays(TODAY, i));
  const firstOpen = week.find((d) => dayStatus(inv, boat.id, d, guests) === 'available' || dayStatus(inv, boat.id, d, guests) === 'limited') ?? TODAY;
  const defaultDate = boat.id === 'lagoon380' ? '2026-10-18' : firstOpen;
  const s = boat.specs;
  const specs: [IconName, string, string][] = [
    ['maximize-2', 'Length', s.length],
    ['layout', 'Layout', s.cabins ? `${s.cabins} cabins` : 'Open deck'],
    ['moon', 'Berths', s.berths ? `${s.berths} berths` : 'Day only'],
    ['users', 'Capacity', `${s.maxGuests} guests`],
    ['calendar', 'Year', s.year],
    ['anchor', 'Crew', s.skipper ? 'Skipper incl.' : 'Bareboat'],
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView testID="boat-detail" contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        <View>
          <Image source={images[boat.image]} style={styles.hero} />
          <View style={[styles.heroBar, { top: insets.top + 6 }]}>
            <IconButton icon="arrow-left" label="Back" testID="back" filled onPress={goBack} />
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <IconButton icon="share-2" label="Share" filled />
              <IconButton icon="heart" label="Save" filled />
            </View>
          </View>
          <LivePill from={SOURCE_LABEL[boat.source]} base={8} style={{ position: 'absolute', left: 16, bottom: 16 }} />
          <View style={styles.counter}><Icon name="camera" size={12} color={colors.white} /><T variant="caption" style={{ color: colors.white }}>1 / 24</T></View>
        </View>

        <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <T variant="overline" style={{ color: colors.warningText }}>{s.skipper ? 'Crewed' : 'Bareboat'} {boat.type}</T>
            <Tag label="Charter verified" tone="brass" icon="check-circle" />
          </View>
          <T variant="serif" style={{ fontSize: 30, lineHeight: 38, marginTop: 6 }}>{boat.name}</T>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
            <Icon name="map-pin" size={14} color={colors.text2} />
            <T variant="label" style={{ color: colors.text2, flex: 1 }}>{boat.location} · {boat.operator}</T>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 }}>
            <Icon name="star" size={14} color={colors.warningText} />
            <T variant="label" num style={{ fontFamily: font.semibold }}>{boat.rating.toFixed(2)}</T>
            <T variant="label" style={{ color: colors.text2, textDecorationLine: 'underline' }}>({boat.reviews} reviews)</T>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, marginBottom: 12 }}>
            <T variant="title">Vessel specifications</T>
            <T variant="caption">From manifest</T>
          </View>
          <View style={styles.grid}>
            {specs.map(([icon, k, v], i) => (
              <View key={k} style={[styles.spec, i === 5 && { backgroundColor: colors.brassTint, borderColor: colors.brass }]}>
                <Icon name={icon} size={16} color={colors.accent} />
                <T variant="caption" style={{ marginTop: 6 }}>{k}</T>
                <T variant="label" style={{ fontFamily: font.semibold }}>{v}</T>
              </View>
            ))}
          </View>

          <Card style={{ padding: 16, marginTop: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <T variant="title">Next 7 days</T>
              <Tag label="Live sync" tone="brass" />
              <T variant="caption" style={{ marginLeft: 'auto' }}>{guests} guests</T>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              {week.map((d, i) => {
                const st = dayStatus(inv, boat.id, d, guests);
                const left = Math.max(0, ...departuresFor(inv, boat.id, d).map((x) => seatsLeft(inv, x.id)));
                const sel = d === defaultDate;
                return (
                  <Pressable key={d} testID={`day-${d}`} onPress={() => router.push(`/calendar/${boat.id}?date=${d}`)} style={[styles.day, sel && { backgroundColor: colors.accent, borderColor: colors.accent }, st === 'limited' && !sel && { backgroundColor: colors.brassTint, borderColor: colors.brass }, st === 'full' && { opacity: 0.5 }]}>
                    <T variant="caption" style={{ fontSize: 12, color: sel ? colors.brass : colors.text2, fontFamily: font.semibold }}>{i === 0 ? 'Today' : dow(d)}</T>
                    <T variant="label" num style={{ fontFamily: font.bold, color: sel ? colors.white : colors.text, textDecorationLine: st === 'full' ? 'line-through' : 'none' }}>{dayNum(d)}</T>
                    {st === 'limited' && !sel ? <T variant="caption" num style={{ fontSize: 12, color: colors.accent }}>{left} left</T> : <View style={{ width: 6, height: 6, borderRadius: 3, marginTop: 4, backgroundColor: sel ? colors.brass : STATUS_COLOR[st] }} />}
                  </Pressable>
                );
              })}
            </View>
            <View style={{ flexDirection: 'row', gap: 14, marginTop: 12 }}>
              {(['available', 'limited', 'full'] as const).map((k) => (
                <View key={k} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: STATUS_COLOR[k] }} />
                  <T variant="caption">{k === 'available' ? 'Available' : k === 'limited' ? 'Low spots' : 'Booked'}</T>
                </View>
              ))}
            </View>
          </Card>

          <T variant="title" style={{ marginTop: 24 }}>About this {boat.type === 'Fast boat' ? 'boat' : 'yacht'}</T>
          <T variant="body" style={{ color: colors.text2, marginTop: 8 }}>{boat.about}</T>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 }}>
            {boat.amenities.map((a) => <Tag key={a} label={a} icon="check" />)}
          </View>

          <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, marginTop: 20 }}>
            <View style={styles.op}><T variant="label" style={{ fontFamily: font.bold }}>{boat.operator.split(' ').map((w) => w[0]).join('').slice(0, 3)}</T></View>
            <View style={{ flex: 1 }}>
              <T variant="label" style={{ fontFamily: font.semibold }}>{boat.operator}</T>
              <T variant="caption">{dest ? `${dest.name} fleet` : 'Harbour fleet'} · calendar via {SOURCE_LABEL[boat.source]}</T>
            </View>
            <Button small kind="secondary" label="Contact" />
          </Card>
        </View>
      </ScrollView>

      <View style={[styles.sticky, { paddingBottom: Math.max(insets.bottom, 12) + 4 }]}>
        <View style={{ flex: 1 }}>
          <T variant="title" num style={{ fontFamily: font.display }}>{money(boat.fromPrice)}<T variant="caption"> / guest</T></T>
          <T variant="caption" style={{ color: colors.successText }}>Includes fuel and skipper</T>
        </View>
        <Button testID="check-availability" label="Check availability" trailing="arrow-right" onPress={() => router.push(`/calendar/${boat.id}?date=${defaultDate}`)} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { width: '100%', height: 330, backgroundColor: colors.surfaceAlt },
  heroBar: { position: 'absolute', left: 16, right: 16, flexDirection: 'row', justifyContent: 'space-between' },
  counter: { position: 'absolute', right: 16, bottom: 16, flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(24,22,20,0.55)', borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 3 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  spec: { width: '31.8%', backgroundColor: colors.surface, borderRadius: 14, borderWidth: 1, borderColor: colors.border, padding: 12 },
  day: { width: 42, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: colors.border, alignItems: 'center', backgroundColor: colors.surface },
  op: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.brassTint, alignItems: 'center', justifyContent: 'center' },
  sticky: { position: 'absolute', left: 0, right: 0, bottom: 0, flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border, paddingHorizontal: 20, paddingTop: 12 },
});
