import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Image, ImageBackground, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card, Thumb } from '../../components/Card';
import { SectionTitle } from '../../components/Header';
import { Icon } from '../../components/Icon';
import { LivePill, SeatsChip } from '../../components/Live';
import { ScalePressable } from '../../components/Pressable';
import { T } from '../../components/Text';
import { images } from '../../data/images';
import { DESTINATIONS, USER, boatById } from '../../data/seed';
import { TODAY, money } from '../../logic/dates';
import { useApp } from '../../store';
import { bestLeft } from '../../store/select';
import { colors, font, radius, shadow } from '../../theme/tokens';

// 03 Explore: greeting, search pill, destinations carousel, featured charter (focal), available today.
export default function Explore() {
  const insets = useSafeAreaInsets();
  const inv = useApp((s) => s.inv);
  const unread = useApp((s) => s.notices.some((n) => n.unread));
  const featured = boatById('aurelia');
  const nearby = ['lagoon380', 'blueHorizon'].map(boatById);

  return (
    <ScrollView testID="explore" style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
      <View style={[styles.pad, { flexDirection: 'row', alignItems: 'center', gap: 12 }]}>
        <Image source={images.avatarOlivia} style={styles.avatar} />
        <View style={{ flex: 1 }}>
          <T variant="overline" style={{ color: colors.warningText, fontSize: 12 }}>Club member</T>
          <T variant="title">Good morning, {USER.first}</T>
        </View>
        <ScalePressable testID="open-notifications" accessibilityRole="button" accessibilityLabel="Notifications" onPress={() => router.push('/notifications')} style={styles.bell}>
          <Icon name="bell" size={20} color={colors.accent} />
          {unread ? <View style={styles.badge} /> : null}
        </ScalePressable>
      </View>

      <View style={styles.pad}>
        <Pressable testID="search-pill" accessibilityRole="search" onPress={() => router.navigate('/search')} style={styles.search}>
          <View style={styles.searchIcon}><Icon name="search" size={18} color={colors.accent} /></View>
          <View style={{ flex: 1 }}>
            <T variant="label" style={{ fontFamily: font.semibold }}>Where to?</T>
            <T variant="caption">Any date · Any guests</T>
          </View>
          <View style={styles.searchIcon}><Icon name="sliders" size={16} color={colors.accent} /></View>
        </Pressable>
      </View>

      <View style={styles.pad}><SectionTitle title="Popular destinations" overline action="View all 8" onAction={() => router.navigate('/search')} /></View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}>
        {DESTINATIONS.map((d) => (
          <ScalePressable key={d.id} testID={`dest-${d.id}`} accessibilityRole="button" accessibilityLabel={d.name} onPress={() => router.push(`/destination/${d.id}`)}>
            <ImageBackground source={images[d.image]} style={styles.dest} imageStyle={{ borderRadius: 18 }}>
              <LinearGradient colors={colors.photoFade} style={[StyleSheet.absoluteFill, { borderRadius: 18 }]} />
              <T variant="label" style={{ color: colors.white, fontFamily: font.bold }}>{d.name}</T>
              <T variant="caption" style={{ color: 'rgba(255,255,255,0.9)' }}>{d.fleet} boats</T>
            </ImageBackground>
          </ScalePressable>
        ))}
      </ScrollView>

      <View style={styles.pad}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, marginBottom: 12 }}>
          <T variant="overline">Exclusive charter</T>
          <T variant="caption">{featured.location.split(',')[0]}</T>
        </View>
        <ScalePressable testID={`featured-${featured.id}`} accessibilityRole="button" onPress={() => router.push(`/boat/${featured.id}`)} scaleTo={0.985}>
          <ImageBackground source={images[featured.image]} style={styles.featured} imageStyle={{ borderRadius: radius.card }}>
            <LinearGradient colors={['rgba(212,176,106,0)', 'rgba(43,42,40,0.35)', 'rgba(43,42,40,0.92)']} locations={[0, 0.45, 1]} style={[StyleSheet.absoluteFill, { borderRadius: radius.card }]} />
            <LivePill base={12} style={{ position: 'absolute', top: 14, left: 14 }} />
            <View style={styles.save}><Icon name="bookmark" size={16} color={colors.white} /></View>
            <T variant="serif" style={{ color: colors.white }}>{featured.name}</T>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
              <Icon name="map-pin" size={13} color={colors.brass} />
              <T variant="caption" style={{ color: 'rgba(255,255,255,0.9)' }}>{featured.location} · 84 ft luxury motor yacht</T>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 14 }}>
              <SeatsChip left={bestLeft(inv, featured.id, TODAY)} style={{ backgroundColor: colors.brass }} />
              <View style={{ alignItems: 'flex-end' }}>
                <T variant="caption" style={{ color: 'rgba(255,255,255,0.85)' }}>from</T>
                <T variant="title" num style={{ color: colors.white, fontFamily: font.bold }}>{money(featured.fromPrice)}<T variant="caption" style={{ color: 'rgba(255,255,255,0.85)' }}> /guest</T></T>
              </View>
            </View>
          </ImageBackground>
        </ScalePressable>

        <SectionTitle title="Available today near you" />
        {nearby.map((b) => (
          <Card key={b.id} testID={`near-${b.id}`} onPress={() => router.push(`/boat/${b.id}`)} style={styles.near}>
            <Thumb image={b.image} size={72} />
            <View style={{ flex: 1, gap: 4 }}>
              <T variant="label" style={{ fontFamily: font.semibold }} numberOfLines={1}>{b.name}</T>
              <T variant="caption" numberOfLines={1}>{b.location}</T>
              <SeatsChip left={bestLeft(inv, b.id, TODAY)} />
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <T variant="label" num style={{ fontFamily: font.bold }}>{money(b.fromPrice)}</T>
              <T variant="caption">/guest</T>
            </View>
          </Card>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  pad: { paddingHorizontal: 20 },
  avatar: { width: 48, height: 48, borderRadius: 24, borderWidth: 2, borderColor: colors.brass },
  bell: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  badge: { position: 'absolute', top: 10, right: 11, width: 8, height: 8, borderRadius: 4, backgroundColor: colors.brass, borderWidth: 1.5, borderColor: colors.surface },
  search: { marginTop: 16, flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.surface, borderRadius: radius.pill, padding: 8, paddingRight: 10, ...shadow },
  searchIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surfaceAlt, alignItems: 'center', justifyContent: 'center' },
  dest: { width: 112, height: 140, justifyContent: 'flex-end', padding: 10 },
  featured: { height: 260, justifyContent: 'flex-end', padding: 16 },
  save: { position: 'absolute', top: 12, right: 12, width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(24,22,20,0.45)', alignItems: 'center', justifyContent: 'center' },
  near: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, marginBottom: 12 },
});
