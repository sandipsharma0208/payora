import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/theme/colors';

export default function ConfirmScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();

  const name = (params.name as string) || 'Mom';
  const phone = (params.phone as string) || '@mom.m · on bBash';
  const amount = (params.amount as string) || '50.00';
  const note = (params.note as string) || '';
  const greetingCard = (params.greetingCard as string) || 'Send Money';
  const newBalance = Math.max(0, 2458.5 - parseFloat(amount));

  const handleHoldComplete = () => {
    router.push({
      pathname: '/send/press-hold',
      params: { name, phone, amount, note, greetingCard },
    });
  };

  return (
    /* Root is PINK — the white card sits on top of it */
    <View style={[styles.root, { paddingTop: insets.top }]}>

      {/* ── White card (rounded bottom corners = dome effect) ── */}
      <View style={styles.card}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            Confirm to{' '}
            <Text style={styles.headerBold}>Send Money</Text>
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons name="close" size={22} color="#111111" />
          </TouchableOpacity>
        </View>

        {/* Recipient */}
        <View style={styles.recipientRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{name[0]?.toUpperCase()}</Text>
          </View>
          <View>
            <Text style={styles.recipientName}>{name}</Text>
            <Text style={styles.recipientSub}>{phone}</Text>
          </View>
        </View>

        {/* Info rows */}
        <View style={styles.divider} />
        <View style={styles.infoRow}>
          <View style={styles.infoCell}>
            <Text style={styles.infoLabel}>Total</Text>
            <Text style={styles.infoValue}>
              ${parseFloat(amount).toFixed(2)}
            </Text>
          </View>
          <View style={styles.infoCell}>
            <Text style={styles.infoLabel}>New Balance</Text>
            <Text style={styles.infoValue}>
              ${newBalance.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />
        <View style={styles.infoRow}>
          <View style={styles.infoCell}>
            <Text style={styles.infoLabel}>Reference</Text>
            <Text style={styles.infoValue}>{note || '—'}</Text>
          </View>
          <View style={styles.infoCell}>
            <Text style={styles.infoLabel}>Greeting Card</Text>
            <Text style={[styles.infoValue, { fontWeight: '700' }]}>
              {greetingCard}
            </Text>
          </View>
        </View>
        <View style={styles.divider} />

        {/* Spacer pushes pink area to bottom */}
        <View style={{ flex: 1 }} />
      </View>

      {/* ── Pink area: hold button + label ── */}
      <View style={styles.pinkArea}>
        <TouchableOpacity
          style={styles.holdBtn}
          activeOpacity={0.85}
          onPress={handleHoldComplete}
        >
          <Image
            source={require('../../assets/payora.png')}
            style={styles.holdLogo}
          />
        </TouchableOpacity>
        <Text style={styles.holdLabel}>Tap and hold for Send Money</Text>
        <View style={{ height: insets.bottom + 12 }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.primary,   // pink shows through rounded corners
  },

  /* White card — rounded bottom corners create the dome against pink */
  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 56,
    borderBottomRightRadius: 56,
    overflow: 'hidden',
  },

  /* Header */
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: 14,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '400',
    color: Colors.primary,
  },
  headerBold: {
    fontWeight: '800',
    color: Colors.primary,
  },

  /* Recipient */
  recipientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingBottom: 16,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#7CB89A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  recipientName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111111',
    marginBottom: 2,
  },
  recipientSub: {
    fontSize: 12,
    color: '#6B7280',
  },

  /* Info grid */
  divider: {
    height: 1,
    backgroundColor: '#F1F2F4',
    marginHorizontal: 22,
  },
  infoRow: {
    flexDirection: 'row',
    paddingHorizontal: 22,
    paddingVertical: 16,
    gap: 16,
  },
  infoCell: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    marginBottom: 5,
  },
  infoValue: {
    fontSize: 17,
    fontWeight: '500',
    color: '#111111',
  },

  /* Pink bottom area */
  pinkArea: {
    alignItems: 'center',
    paddingTop: 28,
  },
  holdBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  holdLogo: {
    width: 46,
    height: 46,
    borderRadius: 23,
  },
  holdLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
});
