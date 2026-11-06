import { router } from 'expo-router';
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BoatCard } from '../../components/BoatCard';
import { Button } from '../../components/Button';
import { Chip } from '../../components/Card';
import { Toggle } from '../../components/Controls';
import { Icon } from '../../components/Icon';
import { LivePill } from '../../components/Live';
import { T } from '../../components/Text';
import { images } from '../../data/images';
import { DESTINATIONS, destById } from '../../data/seed';
import { TODAY, addDays, dow, fmtDay } from '../../logic/dates';
import { useApp } from '../../store';
import { nearbyDates, search } from '../../store/select';
import { colors, font, radius, shadow } from '../../theme/tokens';

const DATES = Array.from({ length: 7 }, (_, i) => addDays(TODAY, i));

// 05 Search results + 06 fully booked: only boats with space for the party on that date.
export default function Search() {
  const insets = useSafeAreaInsets();
  const inv = useApp((s) => s.inv);
  const q = useApp((s) => s.query);
  const setQuery = useApp((s) => s.setQuery);
  const showToast = useApp((s) => s.showToast);
  const dest = destById(q.destinationId)!;
  const results = search(inv, q.destinationId, q.date, q.guests, q.onlyAvailable);
  const empty = results.length === 0;
  const nearby = empty ? nearbyDates(inv, q.destinationId, q.date, q.guests, 2) : [];

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={[styles.top, { paddingTop: insets.top + 8 }]}>
        <View style={styles.bar}>
          <Icon name="search" size={16} color={colors.text2} />
          <T variant="label" testID="search-summary" num style={{ flex: 1, fontFamily: font.semibold }} numberOfLines={1}>{dest.name} · {fmtDay(q.date)} · {q.guests} guests</T>
          <Pressable testID="guests-minus" accessibilityLabel="Fewer guests" hitSlop={6} onPress={() => setQuery({ guests: Math.max(1, q.guests - 1) })} style={styles.step}><Icon name="minus" size={14} color={colors.accent} /></Pressable>
          <Pressable testID="guests-plus" accessibilityLabel="More guests" hitSlop={6} onPress={() => setQuery({ guests: Math.min(14, q.guests + 1) })} style={styles.step}><Icon name="plus" size={14} color={colors.accent} /></Pressable>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 20 }} style={{ marginHorizontal: -20, marginTop: 12 }}>
          {DESTINATIONS.map((d) => <Chip key={d.id} testID={`sdest-${d.id}`} label={d.name} selected={d.id === q.destinationId} onPress={() => setQuery({ destinationId: d.id })} />)}
        </ScrollView>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 20 }} style={{ marginHorizontal: -20, marginTop: 8 }}>
          {DATES.map((d) => (
            <Pressable key={d} testID={`sdate-${d}`} onPress={() => setQuery({ date: d })} style={[styles.date, d === q.date && { backgroundColor: colors.accent, borderColor: colors.accent }]}>
              <T variant="caption" style={{ color: d === q.date ? colors.brass : colors.text2, fontFamily: font.semibold }}>{dow(d).toUpperCase()}</T>
              <T variant="label" num style={{ color: d === q.date ? colors.white : colors.text, fontFamily: font.bold }}>{d.slice(8)}</T>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
        <View style={styles.toggle}>
          <View style={{ flex: 1 }}>
            <T variant="label" style={{ fontFamily: font.semibold }}>Only show boats with space</T>
            <T variant="caption">Instant confirmation available</T>
          </View>
          <Toggle testID="only-available" label="Only show boats with space" value={q.onlyAvailable} onChange={(v) => setQuery({ onlyAvailable: v })} />
        </View>

        {empty ? (
          <View testID="search-empty" style={{ alignItems: 'center' }}>
            <Image source={images.emptyDock} style={styles.illustration} />
            <T variant="hero" style={{ textAlign: 'center', fontSize: 30, lineHeight: 36 }}>Fully booked for this date</T>
            <T variant="body" style={{ textAlign: 'center', color: colors.text2, marginTop: 8 }}>Every boat in {dest.name} is at capacity for {q.guests} guests on {fmtDay(q.date)}.</T>
            <View style={{ alignSelf: 'stretch', flexDirection: 'row', justifyContent: 'space-between', marginTop: 20, marginBottom: 10 }}>
              <T variant="overline">Nearby dates with space</T>
            </View>
            <View style={{ flexDirection: 'row', gap: 12, alignSelf: 'stretch' }}>
              {nearby.map((n) => (
                <Pressable key={n.date} testID={`nearby-${n.date}`} onPress={() => setQuery({ date: n.date })} style={styles.nearby}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <T variant="title">{dow(n.date)} {Number(n.date.slice(8))}</T>
                    <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.success }} />
                  </View>
                  <T variant="caption" num>Availability <T variant="caption" style={{ color: colors.accent, fontFamily: font.semibold }}>{n.boats} {n.boats === 1 ? 'boat' : 'boats'}</T></T>
                </Pressable>
              ))}
            </View>
            <Button testID="try-nearby" label="Try nearby dates" trailing="arrow-right" onPress={() => nearby[0] && setQuery({ date: nearby[0].date })} style={{ alignSelf: 'stretch', marginTop: 20 }} />
            <Button kind="secondary" icon="bell" label="Notify me if a seat opens" onPress={() => showToast(`We will alert you when a seat opens in ${dest.name}`)} style={{ alignSelf: 'stretch', marginTop: 12 }} />
          </View>
        ) : (
          <>
            <T variant="serif" num style={{ marginTop: 18 }}>{results.length} {results.length === 1 ? 'boat' : 'boats'} with space</T>
            <LivePill base={12} style={{ marginTop: 6, marginBottom: 14 }} />
            {results.map((r, i) => (
              <BoatCard key={r.boat.id} testID={`result-${r.boat.id}`} boat={r.boat} left={r.best} guests={q.guests} slots={r.slots} base={3 + i * 4} onPress={() => router.push(`/boat/${r.boat.id}`)} />
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  top: { paddingHorizontal: 20, paddingBottom: 12, backgroundColor: colors.bg, borderBottomWidth: 1, borderBottomColor: colors.border },
  bar: { flexDirection: 'row', alignItems: 'center', gap: 8, height: 48, borderRadius: radius.pill, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, paddingLeft: 16, paddingRight: 6 },
  step: { width: 34, height: 34, borderRadius: 17, backgroundColor: colors.surfaceAlt, alignItems: 'center', justifyContent: 'center' },
  date: { width: 52, height: 56, borderRadius: 14, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  toggle: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 16, backgroundColor: colors.surface, borderRadius: radius.card, padding: 16, ...shadow },
  illustration: { width: '100%', height: 200, borderRadius: radius.card, marginTop: 20, marginBottom: 20 },
  nearby: { flex: 1, backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: 14, gap: 4 },
});
