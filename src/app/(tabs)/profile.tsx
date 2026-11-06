import { router } from 'expo-router';
import { Image, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card, Row, Tag } from '../../components/Card';
import { IconButton } from '../../components/Header';
import { Icon } from '../../components/Icon';
import { T } from '../../components/Text';
import { images } from '../../data/images';
import { USER } from '../../data/seed';
import { useApp } from '../../store';
import { colors, font } from '../../theme/tokens';

// 18 Profile: member card, account rows, preferences, operator console entry (agent badge).
export default function Profile() {
  const insets = useSafeAreaInsets();
  const trips = useApp((s) => Object.values(s.inv.bookings).filter((b) => b.source === 'app').length);
  const showToast = useApp((s) => s.showToast);
  const Group = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <>
      <T variant="overline" style={{ marginTop: 22, marginBottom: 10 }}>{title}</T>
      <Card style={{ overflow: 'hidden' }}>{children}</Card>
    </>
  );
  const Sep = () => <View style={{ height: 1, backgroundColor: colors.border, marginLeft: 64 }} />;

  return (
    <ScrollView testID="profile" style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ paddingTop: insets.top + 8, paddingHorizontal: 20, paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ width: 44 }} />
        <T variant="title">Profile</T>
        <IconButton icon="settings" label="Settings" />
      </View>

      <Card style={{ padding: 16, marginTop: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <Image source={images.avatarOlivia} style={styles.avatar} />
          <View style={{ flex: 1, gap: 3 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <T variant="title" style={{ fontFamily: font.display, fontSize: 22 }}>{USER.name}</T>
              <Tag label="Agent" tone="neutral" />
            </View>
            <T variant="caption" num>Member since {USER.since} · {trips} trips</T>
            <Tag label="Gold charter status" tone="success" />
          </View>
        </View>
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 14 }}>
          {[[String(trips), 'Charters'], ['Gold', 'Charter tier'], ['6', 'Saved boats']].map(([v, k]) => (
            <View key={k} style={styles.stat}>
              <T variant="title" num style={{ fontFamily: font.display }}>{v}</T>
              <T variant="caption">{k}</T>
            </View>
          ))}
        </View>
      </Card>

      <Group title="Account and charters">
        <Row icon="user" title="Personal details" sub="Passport, verification and contacts" />
        <Sep />
        <Row icon="credit-card" title="Payment methods" right={<Tag label="Visa 4242" />} />
        <Sep />
        <Row icon="bell" title="Notifications" sub="Push, email and SMS" right={<Tag label="Email + SMS on" tone="brass" />} testID="row-notifications" onPress={() => router.push('/notifications')} />
        <Sep />
        <Row icon="bookmark" title="Saved boats" right={<Tag label="6" tone="neutral" />} />
      </Group>

      <Group title="Preferences and fleet">
        <Row icon="dollar-sign" title="Currency" right={<Tag label="AUD (A$)" />} />
        <Sep />
        <Row icon="sliders" title="Operator console" sub="Operator PMS and Agency API connected" right={<View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.success }} />} testID="open-operator" onPress={() => router.push('/operator')} />
      </Group>

      <Group title="Support and session">
        <Row icon="help-circle" title="Help centre" />
        <Sep />
        <Row icon="log-out" title="Sign out" danger testID="sign-out" onPress={() => { showToast('Signed out'); router.replace('/'); }} />
      </Group>

      <View style={{ alignItems: 'center', marginTop: 20, gap: 4 }}>
        <Icon name="anchor" size={14} color={colors.text3} />
        <T variant="caption" style={{ color: colors.text3 }}>Tidepass 1.0 · proof of concept</T>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  avatar: { width: 72, height: 72, borderRadius: 36, borderWidth: 2, borderColor: colors.brass },
  stat: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 14, borderWidth: 1, borderColor: colors.border },
});
