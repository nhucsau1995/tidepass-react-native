import { router } from 'expo-router';
import { useState } from 'react';
import { Image, ImageBackground, ScrollView, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../../components/Button';
import { Card, Tag, Thumb } from '../../components/Card';
import { Segmented } from '../../components/Controls';
import { Icon } from '../../components/Icon';
import { LivePill } from '../../components/Live';
import { T } from '../../components/Text';
import { images, logoMark } from '../../data/images';
import { boatById, destById } from '../../data/seed';
import { TODAY, daysBetween, fmtDay } from '../../logic/dates';
import { StatusTag } from '../../components/StatusTag';
import { useApp } from '../../store';
import { colors, font, radius } from '../../theme/tokens';

// 12 My trips (upcoming / past) + 13 empty state.
export default function Bookings() {
  const insets = useSafeAreaInsets();
  const inv = useApp((s) => s.inv);
  const [seg, setSeg] = useState<'Upcoming' | 'Past'>('Upcoming');
  const mine = Object.values(inv.bookings)
    .filter((b) => b.source === 'app')
    .map((b) => ({ b, dep: inv.departures[b.departureId] }))
    .sort((x, y) => x.dep.date.localeCompare(y.dep.date) || Number(x.b.status !== 'confirmed') - Number(y.b.status !== 'confirmed'));
  const list = mine.filter(({ dep }) => (seg === 'Upcoming' ? daysBetween(TODAY, dep.date) >= 0 : daysBetween(TODAY, dep.date) < 0));
  const [first, ...rest] = list;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={{ paddingTop: insets.top + 8, paddingHorizontal: 20, paddingBottom: 12, gap: 14 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Image source={logoMark} style={{ width: 18, height: 23 }} resizeMode="contain" />
          <T variant="serif" style={{ flex: 1 }}>My trips</T>
          <Icon name="sliders" size={20} color={colors.accent} />
        </View>
        <Segmented options={['Upcoming', 'Past'] as const} value={seg} onChange={setSeg} testPrefix="trips" />
      </View>

      {!first ? (
        <View testID="trips-empty" style={{ flex: 1, alignItems: 'center', paddingHorizontal: 32, paddingTop: 12 }}>
          <View style={styles.illus}><Image source={images.emptyTrips} style={{ width: '100%', height: '100%', borderRadius: 18 }} /></View>
          <T variant="hero" style={{ textAlign: 'center', fontSize: 30 }}>{seg === 'Past' ? 'No past trips yet' : 'No trips booked yet'}</T>
          <T variant="body" style={{ textAlign: 'center', color: colors.text2, marginTop: 8 }}>Boats with live availability are waiting in 8 destinations.</T>
          <Button testID="explore-destinations" label="Explore destinations" icon="compass" onPress={() => router.navigate('/explore')} style={{ alignSelf: 'stretch', marginTop: 24 }} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
          <Card testID={`trip-${first.b.id}`} onPress={() => router.push(`/booking/${first.b.id}`)} style={{ padding: 12 }}>
            <ImageBackground source={images[boatById(first.dep.boatId).image]} style={styles.photo} imageStyle={{ borderRadius: 16 }}>
              <LinearGradient colors={colors.photoFade} style={[StyleSheet.absoluteFill, { borderRadius: 16 }]} />
              <View style={{ position: 'absolute', top: 10, left: 10 }}><StatusTag b={first.b} /></View>
              <View style={styles.inDays}><Icon name="clock" size={12} color={colors.accent} /><T variant="caption" num style={{ color: colors.accent, fontFamily: font.semibold }}>in {daysBetween(TODAY, first.dep.date)} days</T></View>
              <T variant="overline" style={{ color: colors.brass, fontSize: 12 }}>{boatById(first.dep.boatId).type} charter</T>
              <T variant="title" style={{ color: colors.white, fontFamily: font.display, fontSize: 24 }}>{boatById(first.dep.boatId).name.split(' - ')[0]}</T>
            </ImageBackground>
            <View style={{ paddingHorizontal: 4, paddingTop: 12, gap: 8 }}>
              <View style={styles.line}><Icon name="calendar" size={15} color={colors.text2} /><T variant="label" num>{fmtDay(first.dep.date)} · {first.dep.time} · {first.b.seats} guests</T></View>
              <View style={styles.line}><Icon name="map-pin" size={15} color={colors.text2} /><T variant="label">{boatById(first.dep.boatId).location}</T></View>
              <View style={styles.ref}>
                <View style={{ flex: 1 }}>
                  <T variant="overline" style={{ fontSize: 12 }}>Booking reference</T>
                  <T variant="label" num numberOfLines={1} adjustsFontSizeToFit style={{ fontFamily: font.bold }}>{first.b.id}</T>
                </View>
                <LivePill base={12} />
              </View>
              <Button label="View booking pass" icon="maximize" onPress={() => router.push(`/booking/${first.b.id}`)} />
            </View>
          </Card>

          {rest.length ? (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, marginBottom: 12 }}>
              <T variant="title">Later charters</T>
              <T variant="caption">{rest.length} upcoming</T>
            </View>
          ) : null}
          {rest.map(({ b, dep }) => {
            const boat = boatById(dep.boatId);
            return (
              <Card key={b.id} testID={`trip-${b.id}`} onPress={() => router.push(`/booking/${b.id}`)} style={{ padding: 12, marginBottom: 12 }}>
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <Thumb image={boat.image} size={72} />
                  <View style={{ flex: 1, gap: 3 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <T variant="label" style={{ fontFamily: font.display, fontSize: 17, flexShrink: 1 }} numberOfLines={1}>{boat.name.split(' - ')[0]}</T>
                      <StatusTag b={b} />
                    </View>
                    <T variant="caption">{boat.location.split(',')[0]} · {destById(boat.destinationId)?.name ?? boat.location.split(',').pop()?.trim()}</T>
                    <T variant="caption" num>{fmtDay(dep.date)} · {dep.time} {dep.label} · {b.seats} guests</T>
                  </View>
                </View>
                <View style={styles.foot}>
                  <T variant="caption" num style={{ color: colors.text3 }}>ID {b.id}</T>
                  <T variant="caption" style={{ color: colors.accent, fontFamily: font.semibold }}>{b.status === 'weather-cancelled' ? 'Refund issued' : 'View details'} ›</T>
                </View>
              </Card>
            );
          })}
          <View style={styles.assure}>
            <Icon name="shield" size={18} color={colors.accent} />
            <T variant="caption" style={{ flex: 1, color: colors.accent }}>Every booking is checked against the operator's live calendar, so a confirmed seat is a seat that exists.</T>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  illus: { width: 220, height: 220, borderRadius: 20, backgroundColor: colors.surface, padding: 10, marginBottom: 24, borderWidth: 1, borderColor: colors.border },
  photo: { height: 150, justifyContent: 'flex-end', padding: 12 },
  inDays: { position: 'absolute', top: 10, right: 10, flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.brassTint, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 3 },
  line: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  ref: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: 14, padding: 12, marginVertical: 4 },
  foot: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.border },
  assure: { flexDirection: 'row', gap: 10, alignItems: 'center', backgroundColor: colors.brassTint, borderRadius: 16, padding: 14, marginTop: 8 },
});
