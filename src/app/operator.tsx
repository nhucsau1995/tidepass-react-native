import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card, Tag, Thumb } from '../components/Card';
import { Toggle } from '../components/Controls';
import { Header, IconButton } from '../components/Header';
import { Icon } from '../components/Icon';
import { PulseDot, useSyncedAgo } from '../components/Live';
import { T } from '../components/Text';
import { SOURCE_LABEL, SOURCE_SHORT } from '../data/models';
import { BOATS, FEEDS } from '../data/seed';
import { TODAY } from '../logic/dates';
import { heldSeats, seatsLeft } from '../logic/inventory';
import { useApp } from '../store';
import { colors, font, radius } from '../theme/tokens';

const FLEET = ['lagoon380', 'blueHorizon', 'bali46', 'aurelia'];

function FeedCard({ source, boats, lag }: (typeof FEEDS)[number]) {
  const ago = useSyncedAgo(lag, source === 'agency' ? 30 : 15);
  return (
    <View style={styles.feed}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
        <PulseDot size={6} color={source === 'manual' ? colors.text3 : colors.success} />
        <T variant="label" style={{ fontFamily: font.semibold, flex: 1 }} numberOfLines={1}>{SOURCE_SHORT[source]}</T>
      </View>
      <T variant="caption" num>{source === 'manual' ? 'By operator' : `Synced ${ago}s ago`}</T>
      <T variant="caption" num style={{ color: colors.text, fontFamily: font.semibold }}>{boats} boats</T>
    </View>
  );
}

// 17 Operator console: feed status per source, today's capacity (focal), block / unblock a boat.
export default function Operator() {
  const insets = useSafeAreaInsets();
  const inv = useApp((s) => s.inv);
  const toggleBlock = useApp((s) => s.toggleBlock);
  const showToast = useApp((s) => s.showToast);
  const today = Object.values(inv.departures).filter((d) => d.date === TODAY && !d.cancelled);
  const cap = today.reduce((n, d) => n + d.capacity, 0);
  const booked = today.reduce((n, d) => n + d.booked + heldSeats(inv, d.id), 0);
  const sellable = today.reduce((n, d) => n + seatsLeft(inv, d.id), 0);
  const pct = cap ? booked / cap : 0;
  const rejected = inv.events.filter((e) => e.kind === 'rejected').length;
  const feedEvents = inv.events.filter((e) => e.kind !== 'rejected').slice(0, 4);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={{ paddingTop: insets.top + 6, paddingHorizontal: 20, paddingBottom: 8 }}>
        <Header title="Operator console" subtitle="Coral Coast Charters" right={<IconButton icon="refresh-cw" label="Sync now" onPress={() => showToast('All feeds re-synced')} />} />
      </View>
      <ScrollView testID="operator" contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, marginBottom: 10 }}>
          <T variant="overline">Feed connections</T>
          <T variant="caption" style={{ color: colors.warningText }}>Auto-sync on</T>
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {FEEDS.map((f) => <FeedCard key={f.source} {...f} />)}
        </View>

        <Card style={{ padding: 18, marginTop: 16, borderTopWidth: 3, borderTopColor: colors.brass }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View>
              <T variant="overline" style={{ fontSize: 12 }}>Today's fleet capacity</T>
              <T variant="caption">All listed boats, all departures</T>
            </View>
            <Tag label={pct > 0.7 ? 'High demand' : 'Normal demand'} tone="brass" icon="trending-up" />
          </View>
          <T variant="display" testID="capacity" num style={{ fontFamily: font.display, marginTop: 10 }}>{booked} <T variant="title" style={{ color: colors.text3 }}>/ {cap}</T></T>
          <T variant="label" num style={{ color: colors.text2 }}>seats booked or held today ({Math.round(pct * 100)}% load)</T>
          <View style={styles.track}><View style={[styles.fill, { width: `${Math.round(pct * 100)}%` }]} /></View>
          <View style={{ flexDirection: 'row', marginTop: 14 }}>
            <View style={{ flex: 1, flexDirection: 'row', gap: 8, alignItems: 'center' }}>
              <Icon name="users" size={18} color={colors.accent} />
              <View><T variant="label" num style={{ fontFamily: font.semibold }}>{sellable} seats</T><T variant="caption">Available to sell</T></View>
            </View>
            <View style={{ flex: 1, flexDirection: 'row', gap: 8, alignItems: 'center' }}>
              <Icon name="anchor" size={18} color={colors.accent} />
              <View><T variant="label" num style={{ fontFamily: font.semibold }}>{today.length} departures</T><T variant="caption">Today</T></View>
            </View>
          </View>
        </Card>

        <View style={{ marginTop: 22, marginBottom: 10 }}>
          <T variant="title">Fleet live inventory</T>
          <T variant="caption">Switch off to block a boat on web, app and admin</T>
        </View>
        {FLEET.map((id) => {
          const b = BOATS.find((x) => x.id === id)!;
          const blocked = !!inv.blocked[id];
          return (
            <Card key={id} style={styles.boat}>
              <Thumb image={b.image} size={64} />
              <View style={{ flex: 1, gap: 4 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <T variant="label" style={{ fontFamily: font.semibold, flexShrink: 1 }} numberOfLines={1}>{b.name.split(' - ')[0]}</T>
                  {blocked ? null : <Tag label="Live" tone="success" />}
                </View>
                <T variant="caption" numberOfLines={1}>{b.specs.maxGuests} guests · {b.location.split(',')[0]}</T>
                {blocked ? <Tag label="Blocked for maintenance" tone="warning" icon="tool" /> : <Tag label={`Feed: ${SOURCE_LABEL[b.source]}`} tone="brass" />}
              </View>
              <Toggle testID={`block-${id}`} label={`${b.name} on sale`} value={!blocked} onChange={() => { toggleBlock(id); showToast(blocked ? `${b.name.split(' - ')[0]} is back on sale` : `${b.name.split(' - ')[0]} blocked on web, app and admin`); }} />
            </Card>
          );
        })}

        <Card style={{ padding: 16, marginTop: 6, gap: 10 }}>
          <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
            <Icon name="shield" size={18} color={colors.successText} />
            <T variant="label" style={{ flex: 1 }}><T variant="label" style={{ fontFamily: font.semibold }}>0 overbookings this month.</T> {rejected} conflicting feed bookings rejected.</T>
          </View>
          {feedEvents.map((e, i) => (
            <View key={i} style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.brass }} />
              <T variant="caption" style={{ flex: 1 }} numberOfLines={1}>{e.detail}</T>
            </View>
          ))}
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  feed: { flex: 1, backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: 10, gap: 2 },
  track: { height: 8, borderRadius: radius.pill, backgroundColor: colors.surfaceAlt, marginTop: 12, overflow: 'hidden' },
  fill: { height: 8, borderRadius: radius.pill, backgroundColor: colors.brass },
  boat: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, marginBottom: 10 },
});
