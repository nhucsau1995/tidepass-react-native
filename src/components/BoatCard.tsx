import { Image, StyleSheet, View } from 'react-native';
import { images } from '../data/images';
import type { Boat } from '../data/models';
import type { Departure } from '../logic/inventory';
import { money } from '../logic/dates';
import { colors, font, radius } from '../theme/tokens';
import { Button } from './Button';
import { Card, Tag } from './Card';
import { Icon } from './Icon';
import { LivePill, SeatsChip } from './Live';
import { T } from './Text';

/** Listing card shared by Destination and Search: photo + Live pill, specs line, price + Reserve. */
export function BoatCard({ boat, left, guests = 1, slots, onPress, testID, base = 12 }: {
  boat: Boat;
  left: number;
  guests?: number;
  slots?: { dep: Departure; left: number }[];
  onPress: () => void;
  testID?: string;
  base?: number;
}) {
  const sold = left < guests;
  return (
    <Card testID={testID} onPress={onPress} style={{ marginBottom: 16, overflow: 'hidden' }}>
      <View style={{ opacity: sold ? 0.55 : 1 }}>
        <Image source={images[boat.image]} style={styles.photo} />
        <LivePill base={base} style={{ position: 'absolute', top: 12, left: 12 }} />
        <View style={styles.heart}><Icon name="heart" size={18} color={colors.accent} /></View>
        <SeatsChip left={left} guests={guests} style={{ position: 'absolute', bottom: 12, right: 12 }} />
      </View>
      <View style={{ padding: 16, gap: 6 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <T variant="title" numberOfLines={1} style={{ flexShrink: 1 }}>{boat.name}</T>
          <Tag label={boat.type} />
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <T variant="caption">by {boat.operator}</T>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Icon name="star" size={13} color={colors.warningText} />
            <T variant="caption" num style={{ color: colors.text, fontFamily: font.semibold }}>{boat.rating.toFixed(2)}</T>
          </View>
        </View>
        {slots && slots.length ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 6, alignItems: 'center' }}>
            <T variant="caption">Departs</T>
            {slots.map(({ dep, left: l }) => (
              <View key={dep.id} style={[styles.slot, l < guests && { opacity: 0.45 }]}>
                <T variant="caption" num style={{ color: colors.accent, fontFamily: font.semibold, textDecorationLine: l < guests ? 'line-through' : 'none' }}>{dep.time}</T>
              </View>
            ))}
          </View>
        ) : null}
        <View style={styles.footer}>
          <View>
            <T variant="overline" style={{ fontSize: 12, color: colors.text3 }}>Starting from</T>
            <T variant="title" num>{money(boat.fromPrice)}<T variant="caption"> / guest</T></T>
          </View>
          <Button small label={sold ? 'Waitlist' : 'Reserve'} kind={sold ? 'secondary' : 'primary'} onPress={onPress} />
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  photo: { width: '100%', height: 168, backgroundColor: colors.surfaceAlt },
  heart: { position: 'absolute', top: 10, right: 10, width: 36, height: 36, borderRadius: 18, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  slot: { borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 12, paddingVertical: 4 },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.border },
});
