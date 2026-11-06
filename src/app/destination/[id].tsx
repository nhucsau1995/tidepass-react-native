import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { ImageBackground, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BoatCard } from '../../components/BoatCard';
import { Chip } from '../../components/Card';
import { IconButton, goBack } from '../../components/Header';
import { Icon } from '../../components/Icon';
import { T } from '../../components/Text';
import { images } from '../../data/images';
import type { BoatType } from '../../data/models';
import { BOATS, destById } from '../../data/seed';
import { TODAY } from '../../logic/dates';
import { useApp } from '../../store';
import { bestLeft } from '../../store/select';
import { colors, font, radius } from '../../theme/tokens';

const FILTERS: ('All' | BoatType)[] = ['All', 'Catamaran', 'Motor yacht', 'Phinisi', 'Fast boat', 'Sailing yacht'];

// 04 Destination: hero photo, live counts for today, type filter, listing cards with Live pills.
export default function DestinationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const dest = destById(id) ?? destById('whitsundays')!;
  const inv = useApp((s) => s.inv);
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('All');
  const boats = BOATS.filter((b) => b.destinationId === dest.id);
  const shown = boats.filter((b) => filter === 'All' || b.type === filter);
  const availableToday = boats.filter((b) => bestLeft(inv, b.id, TODAY) > 0).length;
  const types = FILTERS.filter((f) => f === 'All' || boats.some((b) => b.type === f));

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={[styles.bar, { paddingTop: insets.top + 6 }]}>
        <IconButton icon="arrow-left" label="Back" testID="back" filled onPress={goBack} />
        <T variant="title" style={{ flex: 1, textAlign: 'center' }}>{dest.name}, {dest.country}</T>
        <IconButton icon="sliders" label="Filters" filled />
      </View>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        <ImageBackground source={images[dest.image]} style={styles.hero} imageStyle={{ borderRadius: radius.card }}>
          <LinearGradient colors={colors.photoFade} style={[StyleSheet.absoluteFill, { borderRadius: radius.card }]} />
          <View style={styles.region}>
            <Icon name="map-pin" size={12} color={colors.white} />
            <T variant="caption" style={{ color: colors.white }}>{dest.region}</T>
          </View>
          <T variant="serif" style={{ color: colors.white, fontSize: 30, lineHeight: 36 }}>{dest.name}, {dest.country}</T>
          <T variant="label" num style={{ color: colors.white }}>{dest.fleet} boats · <T variant="label" style={{ color: colors.white, fontFamily: font.bold }}>{availableToday} with live feeds available today</T></T>
        </ImageBackground>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -20, marginVertical: 16 }} contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}>
          {types.map((f) => <Chip key={f} label={f} selected={f === filter} onPress={() => setFilter(f)} testID={`filter-${f}`} />)}
        </ScrollView>
        {shown.map((b, i) => (
          <BoatCard key={b.id} testID={`boat-${b.id}`} boat={b} left={bestLeft(inv, b.id, TODAY)} base={4 + i * 5} onPress={() => router.push(`/boat/${b.id}`)} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20, paddingBottom: 10 },
  hero: { height: 190, justifyContent: 'flex-end', padding: 16, gap: 2 },
  region: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', borderRadius: radius.pill, backgroundColor: 'rgba(24,22,20,0.45)', paddingHorizontal: 10, paddingVertical: 3, marginBottom: 6 },
});
