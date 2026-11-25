import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../src/theme/colors';

export default function SendAbroadScreen() {
  const router = useRouter();
  const [sendAmount, setSendAmount] = useState('200');
  const rate = 119.50;
  const fee = 1.50;

  const numSend = parseFloat(sendAmount) || 0;
  const netSend = Math.max(0, numSend - fee);
  const receiveAmount = (netSend * rate).toFixed(2);

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#111111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Send Abroad</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Send money abroad at the real rate</Text>
        <Text style={styles.subtitle}>
          Fast international transfers to 60+ countries with transparent, low fees.
        </Text>

        {/* You Send Box */}
        <View style={styles.currencyBox}>
          <View style={styles.boxHeader}>
            <Text style={styles.boxLabel}>You send</Text>
            <View style={styles.flagPill}>
              <Text style={styles.flag}>🇺🇸</Text>
              <Text style={styles.currencyName}>USD</Text>
            </View>
          </View>
          <View style={styles.inputRow}>
            <Text style={styles.currencySymbol}>$</Text>
            <TextInput
              style={styles.amountInput}
              keyboardType="numeric"
              value={sendAmount}
              onChangeText={setSendAmount}
            />
          </View>
        </View>

        {/* Breakdown Connecting Lines */}
        <View style={styles.breakdownContainer}>
          <View style={styles.breakdownRow}>
            <View style={styles.dot} />
            <Text style={styles.breakdownLabel}>Transfer Fee (Upfront)</Text>
            <Text style={styles.breakdownValue}>${fee.toFixed(2)} USD</Text>
          </View>

          <View style={styles.breakdownRow}>
            <View style={styles.dot} />
            <Text style={styles.breakdownLabel}>Amount converted</Text>
            <Text style={styles.breakdownValue}>${netSend.toFixed(2)} USD</Text>
          </View>

          <View style={styles.breakdownRow}>
            <View style={[styles.dot, styles.dotHighlight]} />
            <Text style={styles.breakdownLabelHighlight}>Guaranteed Rate</Text>
            <Text style={styles.breakdownValueHighlight}>1 USD = {rate.toFixed(2)} BDT</Text>
          </View>
        </View>

        {/* Recipient Gets Box */}
        <View style={styles.currencyBox}>
          <View style={styles.boxHeader}>
            <Text style={styles.boxLabel}>Recipient gets</Text>
            <View style={styles.flagPill}>
              <Text style={styles.flag}>🇧🇩</Text>
              <Text style={styles.currencyName}>BDT</Text>
            </View>
          </View>
          <View style={styles.inputRow}>
            <Text style={styles.currencySymbol}>৳</Text>
            <Text style={styles.receiveAmountText}>{receiveAmount}</Text>
          </View>
        </View>

        {/* Advantage Banner */}
        <View style={styles.savingsBanner}>
          <Ionicons name="sparkles" size={20} color="#059669" style={{ marginRight: 8 }} />
          <Text style={styles.savingsText}>
            You save <Text style={{ fontWeight: '800' }}>$18.50</Text> vs typical retail bank wire fees!
          </Text>
        </View>
      </ScrollView>

      {/* Bottom Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.sendButton}
          activeOpacity={0.85}
          onPress={() =>
            router.push({
              pathname: '/send/pick',
              params: { note: 'International Remittance (BDT)' },
            })
          }
        >
          <Text style={styles.sendButtonText}>Continue to Recipient</Text>
          <Ionicons name="arrow-forward" size={18} color="#FFFFFF" style={{ marginLeft: 6 }} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111111',
  },
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111111',
    marginTop: 8,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 24,
    lineHeight: 20,
  },
  currencyBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  boxHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  boxLabel: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '600',
  },
  flagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  flag: {
    fontSize: 16,
    marginRight: 6,
  },
  currencyName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111111',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencySymbol: {
    fontSize: 26,
    fontWeight: '700',
    color: Colors.primary,
    marginRight: 6,
  },
  amountInput: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111111',
    flex: 1,
  },
  receiveAmountText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111111',
  },
  breakdownContainer: {
    paddingVertical: 14,
    paddingLeft: 16,
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D1D5DB',
    marginRight: 10,
  },
  dotHighlight: {
    backgroundColor: Colors.primary,
  },
  breakdownLabel: {
    fontSize: 13,
    color: '#6B7280',
    flex: 1,
  },
  breakdownValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
  },
  breakdownLabelHighlight: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
    flex: 1,
  },
  breakdownValueHighlight: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.primary,
  },
  savingsBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderRadius: 16,
    padding: 14,
    marginTop: 20,
  },
  savingsText: {
    fontSize: 13,
    color: '#065F46',
    flex: 1,
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  sendButton: {
    height: 54,
    borderRadius: 27,
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
