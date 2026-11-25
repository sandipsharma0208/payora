import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/theme/colors';

export default function AmountScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const recipientName = (params.name as string) || 'Sofia Martínez';
  const recipientPhone = (params.phone as string) || '+1 555 018 7722';

  const [amountStr, setAmountStr] = useState('50');
  const [selectedCard, setSelectedCard] = useState('send');
  const numericAmount = Number.parseFloat(amountStr);
  const displayAmount = Number.isFinite(numericAmount) ? numericAmount : 0;
  const canProceed = displayAmount > 0;

  const greetingCards = [
    { id: 'send', label: 'Send Money', icon: 'cash-outline', color: '#D81B60', background: '#FCE4EC' },
    { id: 'wishes', label: 'Best Wishes', icon: 'airplane-outline', color: '#536DFE', background: '#E8EAF6' },
    { id: 'birthday', label: 'Birthday', icon: 'gift-outline', color: '#00897B', background: '#E0F2F1' },
  ];

  const handleAmountChange = (value: string) => {
    const digitsAndDecimal = value.replace(/[^\d.]/g, '');
    const decimalIndex = digitsAndDecimal.indexOf('.');
    const nextAmount =
      decimalIndex === -1
        ? digitsAndDecimal
        : `${digitsAndDecimal.slice(0, decimalIndex + 1)}${digitsAndDecimal
            .slice(decimalIndex + 1)
            .replace(/\./g, '')
            .slice(0, 2)}`;
    if (nextAmount.length <= 7) {
      setAmountStr(nextAmount);
    }
  };

  const handleProceed = () => {
    if (canProceed) {
      router.push({
        pathname: '/send/confirm',
        params: {
          name: recipientName,
          phone: recipientPhone,
          amount: amountStr,
          note: '',
          greetingCard: greetingCards.find((card) => card.id === selectedCard)?.label || 'Send Money',
        },
      });
    }
  };

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <View style={styles.screenContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Send Money</Text>
          <Image source={require('../../assets/payora.png')} style={styles.brandIcon} />
        </View>

        <ScrollView
          style={styles.body}
          contentContainerStyle={styles.bodyContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.recipientRow}>
            <View style={styles.recipientAvatar}>
              <Text style={styles.avatarInitial}>{recipientName[0]}</Text>
            </View>
            <View style={styles.recipientMeta}>
              <Text style={styles.recipientName}>{recipientName}</Text>
              <Text style={styles.recipientPhone}>{recipientPhone} · on Payora</Text>
            </View>
            <Text style={styles.favoriteTag}>Favorites</Text>
          </View>

          <View style={styles.amountSection}>
            <View style={styles.amountSummary}>
              <View>
                <Text style={styles.summaryLabel}>Amount</Text>
                <Text style={styles.summaryValue}>${displayAmount.toFixed(2)}</Text>
              </View>
              <View>
                <Text style={styles.summaryLabel}>Charge</Text>
                <Text style={styles.summaryValue}>Free</Text>
              </View>
              <View style={styles.totalColumn}>
                <Text style={styles.summaryLabel}>Total</Text>
                <Text style={styles.totalValue}>${displayAmount.toFixed(2)}</Text>
              </View>
            </View>
            <View style={styles.amountEntry}>
              <Text style={styles.currencySymbol}>$</Text>
              <TextInput
                style={[styles.amountDisplay, { width: Math.max(50, amountStr.length * 18) }]}
                value={amountStr}
                onChangeText={handleAmountChange}
                keyboardType="decimal-pad"
                maxLength={7}
                autoFocus
                returnKeyType="done"
                accessibilityLabel="Transfer amount in US dollars"
              />
            </View>
            <Text style={styles.balanceText}>Available Balance: $2,458.50</Text>
          </View>

          <View style={styles.greetingSection}>
            <Text style={styles.sectionLabel}>Select a Greeting Card</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.greetingCards}
            >
              {greetingCards.map((card) => (
                <TouchableOpacity
                  key={card.id}
                  style={[
                    styles.greetingCard,
                    { backgroundColor: card.background },
                    selectedCard === card.id && styles.greetingCardSelected,
                  ]}
                  onPress={() => setSelectedCard(card.id)}
                  activeOpacity={0.75}
                >
                  <Ionicons name={card.icon as any} size={23} color={card.color} />
                  <Text style={styles.greetingCardLabel}>{card.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </ScrollView>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.nextButton, canProceed ? styles.nextActive : styles.nextDisabled]}
            disabled={!canProceed}
            onPress={handleProceed}
            activeOpacity={0.85}
          >
            <Text style={styles.nextText}>Proceed</Text>
            <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
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
  body: {
    flex: 1,
  },
  bodyContent: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 8,
  },
  recipientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
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
    fontWeight: '700',
    color: '#111111',
  },
  recipientPhone: {
    fontSize: 10,
    color: '#6B7280',
  },
  favoriteTag: {
    color: Colors.primary,
    backgroundColor: '#FCE7EB',
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 3,
    fontSize: 9,
    fontWeight: '600',
  },
  amountSection: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F2F4',
  },
  amountSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  summaryLabel: {
    color: '#6B7280',
    fontSize: 9,
    marginBottom: 2,
  },
  summaryValue: {
    color: '#111111',
    fontSize: 11,
    fontWeight: '600',
  },
  totalColumn: {
    alignItems: 'flex-end',
  },
  totalValue: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: '800',
  },
  amountEntry: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  currencySymbol: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.primary,
    marginRight: 2,
  },
  amountDisplay: {
    fontSize: 30,
    fontWeight: '800',
    color: Colors.primary,
    padding: 0,
    textAlign: 'center',
  },
  balanceText: {
    fontSize: 9,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 2,
  },
  greetingSection: {
    marginTop: 10,
  },
  sectionLabel: {
    fontSize: 11,
    color: '#111111',
    fontWeight: '600',
    marginBottom: 6,
  },
  greetingCards: {
    flexDirection: 'row',
    paddingBottom: 4,
  },
  greetingCard: {
    width: 82,
    height: 64,
    borderRadius: 8,
    marginRight: 7,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  greetingCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: '#FCE4EC',
  },
  greetingCardLabel: {
    color: '#374151',
    fontSize: 9,
    fontWeight: '600',
    marginTop: 4,
  },
  buttonContainer: {
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  nextButton: {
    height: 38,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  nextActive: {
    backgroundColor: Colors.primary,
  },
  nextDisabled: {
    backgroundColor: '#E5E7EB',
  },
  nextText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
