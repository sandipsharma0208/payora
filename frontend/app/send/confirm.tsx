import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/theme/colors';

export default function ConfirmScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const name = (params.name as string) || 'Sofia Martínez';
  const phone = (params.phone as string) || '+1 555 018 7722';
  const amount = (params.amount as string) || '45.00';
  const note = (params.note as string) || '';
  const greetingCard = (params.greetingCard as string) || 'Send Money';
  const newBalance = Math.max(0, 2458.5 - Number.parseFloat(amount));

  const [pin, setPin] = useState('');

  const handlePinChange = (value: string) => {
    setPin(value.replace(/\D/g, '').slice(0, 5));
  };

  const handleSubmitPin = () => {
    if (pin.length !== 5) return;
    router.push({
      pathname: '/send/press-hold',
      params: { name, phone, amount, note, greetingCard, pin },
    });
  };

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <View style={styles.screenContent}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Send Money</Text>
          <Image source={require('../../assets/payora.png')} style={styles.brandIcon} />
        </View>

        <View style={styles.content}>
          <View style={styles.recipientRow}>
            <View style={styles.recipientAvatar}>
              <Text style={styles.avatarInitial}>{name[0]}</Text>
            </View>
            <View style={styles.recipientMeta}>
              <Text style={styles.recipientName}>{name}</Text>
              <Text style={styles.recipientHandle}>{phone} · on Payora</Text>
            </View>
            <Text style={styles.favoriteTag}>Favorites</Text>
          </View>

          <View style={styles.amountSummary}>
            <View>
              <Text style={styles.summaryLabel}>Total</Text>
              <Text style={styles.summaryValue}>${parseFloat(amount).toFixed(2)}</Text>
            </View>
            <View>
              <Text style={styles.summaryLabel}>New Balance</Text>
              <Text style={styles.summaryValue}>
                ${newBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Text>
            </View>
          </View>

          <View style={styles.referenceRow}>
            <Text style={styles.summaryLabel}>Reference</Text>
            <Text style={styles.referenceValue}>{note || '—'}</Text>
          </View>

          <View style={styles.greetingRow}>
            <Text style={styles.summaryLabel}>Greeting Card</Text>
            <Text style={styles.referenceValue}>{greetingCard}</Text>
          </View>

          <View style={styles.pinEntry}>
            <Ionicons name="lock-closed" size={17} color="#111827" />
            <TextInput
              style={styles.pinInput}
              value={pin}
              onChangeText={handlePinChange}
              keyboardType="number-pad"
              maxLength={5}
              secureTextEntry
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleSubmitPin}
              placeholder="Enter PIN"
              placeholderTextColor="#9CA3AF"
              accessibilityLabel="Enter your five-digit payment PIN"
            />
            <Text style={styles.pinCount}>{pin.length}/5</Text>
          </View>
          <TouchableOpacity
            style={[styles.continueButton, pin.length === 5 && styles.continueButtonActive]}
            onPress={handleSubmitPin}
            disabled={pin.length !== 5}
            activeOpacity={0.85}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
            <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  screenContent: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 50,
    paddingHorizontal: 14,
    backgroundColor: Colors.primary,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  brandIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  recipientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F2F4',
  },
  recipientAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#8FC49A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  avatarInitial: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  recipientMeta: {
    flex: 1,
  },
  recipientName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111827',
  },
  recipientHandle: {
    color: '#6B7280',
    fontSize: 9,
  },
  favoriteTag: {
    color: Colors.primary,
    backgroundColor: '#FCE7EB',
    borderRadius: 7,
    paddingHorizontal: 6,
    paddingVertical: 2,
    fontSize: 8,
    fontWeight: '600',
  },
  amountSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F2F4',
  },
  summaryLabel: {
    color: '#6B7280',
    fontSize: 9,
    marginBottom: 2,
  },
  summaryValue: {
    color: '#111827',
    fontSize: 11,
    fontWeight: '600',
  },
  referenceRow: {
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F2F4',
  },
  referenceValue: {
    color: '#111827',
    fontSize: 10,
    marginTop: 2,
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F2F4',
  },
  pinEntry: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  pinInput: {
    flex: 1,
    fontSize: 11,
    marginLeft: 8,
    color: '#111827',
    padding: 0,
  },
  continueButton: {
    height: 38,
    borderRadius: 8,
    backgroundColor: '#D1D5DB',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    marginTop: 8,
  },
  continueButtonActive: {
    backgroundColor: Colors.primary,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  pinCount: {
    fontSize: 9,
    color: '#9CA3AF',
  },
});
