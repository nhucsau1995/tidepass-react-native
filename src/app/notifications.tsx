import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../components/Button';
import { Card, Chip, Tag, Thumb } from '../components/Card';
import { Header, IconButton } from '../components/Header';
import { Icon, type IconName } from '../components/Icon';
import { T } from '../components/Text';
import type { Notice } from '../data/models';
import { boatById } from '../data/seed';
import { useApp } from '../store';
import { colors, font } from '../theme/tokens';

const ICON: Record<Notice['kind'], IconName> = { weather: 'cloud-lightning', seat: 'anchor', reminder: 'clock', booking: 'check-circle', payment: 'credit-card' };

// 16 Notifications: weather cancellation alert (focal), seat opened, booking confirmations.
export default function Notifications() {
  const insets = useSafeAreaInsets();
  const notices = useApp((s) => s.notices);
  const markAllRead = useApp((s) => s.markAllRead);
  const [filter, setFilter] = useState<'All' | 'Alerts' | 'Bookings'>('All');
  const unread = notices.filter((n) => n.unread).length;
  const weather = notices.find((n) => n.kind === 'weather');
  const rest = notices
    .filter((n) => n !== weather)
    .filter((n) => filter === 'All' || (filter === 'Alerts' ? n.kind === 'seat' || n.kind === 'reminder' : n.kind === 'booking' || n.kind === 'payment'));

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={{ paddingTop: insets.top + 6, paddingHorizontal: 20, paddingBottom: 8 }}>
        <Header title="Notifications" right={<IconButton icon="check-square" label="Mark all read" testID="mark-read" onPress={markAllRead} />} />
      </View>
      <ScrollView testID="notifications" contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', marginTop: 4 }}>
          {(['All', 'Alerts', 'Bookings'] as const).map((f) => <Chip key={f} label={f} selected={f === filter} onPress={() => setFilter(f)} />)}
          {unread ? <View style={{ marginLeft: 'auto' }}><Tag label={`${unread} unread`} tone="brass" /></View> : null}
        </View>

        {weather && filter !== 'Bookings' ? (
          <Card style={styles.alert}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Tag label="Weather cancellation" tone="warning" icon="alert-triangle" />
              <T variant="caption">Thu 6 Nov</T>
            </View>
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
              <Thumb image={boatById(weather.boatId!).image} size={64} />
              <View style={{ flex: 1 }}>
                <T variant="title">{weather.title}</T>
                <T variant="caption" style={{ marginTop: 4 }}>{weather.body}</T>
              </View>
            </View>
            <View style={styles.refund}>
              <Icon name="credit-card" size={16} color={colors.accent} />
              <T variant="caption" style={{ flex: 1, color: colors.text }}>A$960 refunded to Visa 4242</T>
              <Tag label="Settled" tone="success" />
            </View>
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
              <Button small label="Rebook" trailing="arrow-right" style={{ flex: 1 }} onPress={() => router.push(`/calendar/${weather.boatId}?date=2026-11-07`)} />
              <Button small kind="secondary" label="View refund" style={{ flex: 1 }} onPress={() => router.push(`/booking/${weather.bookingId}`)} />
            </View>
          </Card>
        ) : null}

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 22, marginBottom: 10 }}>
          <T variant="overline">Recent activity</T>
          <T variant="caption">Live sync</T>
        </View>
        {rest.map((n) => (
          <Card key={n.id} testID={`notice-${n.id}`} onPress={n.bookingId ? () => router.push(`/booking/${n.bookingId}`) : n.boatId ? () => router.push(`/boat/${n.boatId}`) : undefined} style={styles.item}>
            <View style={[styles.icon, n.kind === 'booking' && { backgroundColor: colors.successTint }]}>
              <Icon name={ICON[n.kind]} size={18} color={n.kind === 'booking' ? colors.successText : colors.accent} />
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <T variant="label" style={{ fontFamily: font.semibold, flex: 1 }}>{n.title}</T>
                <T variant="caption" style={{ color: colors.text3 }}>{n.when}</T>
              </View>
              <T variant="caption">{n.body}</T>
            </View>
            {n.unread ? <View style={styles.dot} /> : null}
          </Card>
        ))}
        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, marginTop: 12 }}>
          <Icon name="sliders" size={14} color={colors.text2} />
          <T variant="caption">Alerts by push, email and SMS</T>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  alert: { padding: 16, marginTop: 16, backgroundColor: '#FFFBF4', borderWidth: 1, borderColor: '#F3DDB8' },
  refund: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 10, backgroundColor: colors.surface },
  item: { flexDirection: 'row', gap: 12, padding: 14, marginBottom: 10 },
  icon: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.brassTint, alignItems: 'center', justifyContent: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.brass, marginTop: 6 },
});
