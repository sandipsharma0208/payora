import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../src/theme/colors';
import { ApiService } from '../src/services/api';

type Step = 0 | 1 | 2 | 3;
type DeliveryMethod = 'bank' | 'wallet' | 'cash';
type PayMethod = 'balance' | 'bank_transfer' | 'debit';

interface RecipientOption {
  id: string;
  name: string;
  subtitle: string;
  avatar: string;
  color: string;
  currency: string;
}

const STEPS = ['Amount', 'Recipient', 'Purpose', 'Review'];

const SOURCE_CURRENCIES = [
  { code: 'USD', symbol: '$', rateToUsd: 1 },
  { code: 'EUR', symbol: '€', rateToUsd: 1.09 },
  { code: 'GBP', symbol: '£', rateToUsd: 1.27 },
];

const DEST_CURRENCIES = [
  { code: 'BDT', symbol: '৳', country: 'Bangladesh', name: 'Bangladeshi Taka', rateFromUsd: 119.6 },
  { code: 'INR', symbol: '₹', country: 'India', name: 'Indian Rupee', rateFromUsd: 84.1 },
  { code: 'PKR', symbol: '₨', country: 'Pakistan', name: 'Pakistani Rupee', rateFromUsd: 278.4 },
  { code: 'PHP', symbol: '₱', country: 'Philippines', name: 'Philippine Peso', rateFromUsd: 58.2 },
  { code: 'EUR', symbol: '€', country: 'Eurozone', name: 'Euro', rateFromUsd: 0.92 },
  { code: 'GBP', symbol: '£', country: 'United Kingdom', name: 'British Pound', rateFromUsd: 0.79 },
];

const PURPOSES = [
  { id: 'family', label: 'Supporting family', icon: 'people-outline' as const },
  { id: 'bills', label: 'Paying bills or rent', icon: 'receipt-outline' as const },
  { id: 'education', label: 'Education or tuition', icon: 'school-outline' as const },
  { id: 'gift', label: 'Gift', icon: 'gift-outline' as const },
  { id: 'goods', label: 'Goods or services', icon: 'cart-outline' as const },
  { id: 'savings', label: 'Savings or investment', icon: 'trending-up-outline' as const },
  { id: 'salary', label: 'Salary or wages', icon: 'briefcase-outline' as const },
  { id: 'travel', label: 'Travel', icon: 'airplane-outline' as const },
];

const INITIAL_RECIPIENTS: RecipientOption[] = [
  {
    id: 'ammu',
    name: 'Ammu',
    subtitle: 'Bank deposit ••••5678 · Dutch-Bangla Bank',
    avatar: 'A',
    color: '#D4A574',
    currency: 'BDT',
  },
  {
    id: 'rahim',
    name: 'Rahim Uddin',
    subtitle: 'Mobile wallet ••••801899 · 442',
    avatar: 'R',
    color: '#8BB3D9',
    currency: 'BDT',
  },
];

export default function SendAbroadScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [step, setStep] = useState<Step>(0);
  const [sendAmount, setSendAmount] = useState('100');
  const [sourceIdx, setSourceIdx] = useState(0);
  const [destIdx, setDestIdx] = useState(0);
  const [delivery, setDelivery] = useState<DeliveryMethod>('bank');
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [currencyPickerTarget, setCurrencyPickerTarget] = useState<'source' | 'dest' | null>(null);
  const [availableBalance, setAvailableBalance] = useState<number>(2458.5);

  // Step 2: Recipient
  const [recipientQuery, setRecipientQuery] = useState('');
  const [recipients, setRecipients] = useState<RecipientOption[]>(INITIAL_RECIPIENTS);
  const [selectedRecipient, setSelectedRecipient] = useState<RecipientOption | null>(
    INITIAL_RECIPIENTS[0],
  );
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [newRecName, setNewRecName] = useState('');
  const [newRecAccount, setNewRecAccount] = useState('');

  // Step 3: Purpose
  const [selectedPurpose, setSelectedPurpose] = useState<string>('Supporting family');

  // Step 4: Review & Receipt
  const [payMethod, setPayMethod] = useState<PayMethod>('balance');
  const [agreedTerms, setAgreedTerms] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [receiptVisible, setReceiptVisible] = useState(false);
  const [txRef, setTxRef] = useState('');
  const [cancelSeconds, setCancelSeconds] = useState(30 * 60);

  useEffect(() => {
    ApiService.getAccounts()
      .then((accs) => {
        const primary = accs.find((a) => a.isPrimary || a.currency === 'USD');
        if (primary) setAvailableBalance(primary.balance);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!receiptVisible) return;
    const timer = setInterval(() => {
      setCancelSeconds((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [receiptVisible]);

  const source = SOURCE_CURRENCIES[sourceIdx];
  const dest = DEST_CURRENCIES[destIdx];

  const numSend = parseFloat(sendAmount) || 0;
  const baseFee = 0.99;
  const debitExtraFee = payMethod === 'debit' ? +(numSend * 0.007).toFixed(2) : 0;
  const totalFee = +(baseFee + debitExtraFee).toFixed(2);
  const converted = Math.max(0, numSend - totalFee);
  const effectiveRate = +(dest.rateFromUsd * source.rateToUsd).toFixed(2);
  const receiveRaw = converted * effectiveRate;
  const receiveFormatted = receiveRaw.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const savingsFormatted = (receiveRaw * 0.167).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const insufficientFunds = source.code === 'USD' && numSend > availableBalance;
  const invalidAmount = numSend < 2;

  const deliveryLabel =
    delivery === 'bank'
      ? 'Bank deposit'
      : delivery === 'wallet'
        ? 'Mobile wallet'
        : 'Cash pickup';

  const arrivalText =
    delivery === 'wallet'
      ? 'Should arrive in seconds'
      : delivery === 'cash'
        ? 'Ready for pickup in minutes'
        : 'Should arrive by Sat 21 Nov';

  const arrivalSub =
    delivery === 'wallet'
      ? `Mobile wallets in ${dest.code} settle instantly 24/7`
      : delivery === 'cash'
        ? `Cash pickup available at 5,000+ agent locations in ${dest.country}`
        : `Bank deposits in ${dest.code} take about 1 business day`;

  const handleBack = () => {
    if (step > 0) {
      setStep((step - 1) as Step);
    } else {
      router.back();
    }
  };

  const filteredRecipients = recipients.filter(
    (r) =>
      r.name.toLowerCase().includes(recipientQuery.toLowerCase()) ||
      r.subtitle.toLowerCase().includes(recipientQuery.toLowerCase()),
  );

  const handleAddRecipient = () => {
    if (!newRecName.trim()) {
      Alert.alert('Missing Name', 'Please enter the recipient full name.');
      return;
    }
    const item: RecipientOption = {
      id: Date.now().toString(),
      name: newRecName.trim(),
      subtitle: `${deliveryLabel} · ${newRecAccount.trim() || '••••1234'}`,
      avatar: newRecName.trim()[0].toUpperCase(),
      color: '#B589D6',
      currency: dest.code,
    };
    setRecipients((prev) => [item, ...prev]);
    setSelectedRecipient(item);
    setNewRecName('');
    setNewRecAccount('');
    setAddModalVisible(false);
    setStep(2);
  };

  const executeTransfer = async () => {
    setSubmitting(true);
    try {
      const res = await ApiService.sendTransfer({
        recipientName: selectedRecipient?.name || 'Ammu',
        amount: numSend,
        currency: source.code,
        note: `Send Abroad (${dest.code} ${receiveFormatted}) · ${selectedPurpose}`,
      });
      if (typeof res?.newBalance === 'number') {
        setAvailableBalance(res.newBalance);
      } else if (payMethod === 'balance') {
        setAvailableBalance((b) => Math.max(0, b - numSend));
      }
      setTxRef(res?.referenceId || `TX${Math.floor(10000000 + Math.random() * 90000000)}`);
      setCancelSeconds(30 * 60);
      setReceiptVisible(true);
    } catch {
      Alert.alert('Transfer Failed', 'Could not submit international transfer. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelWithin30Min = async () => {
    setSubmitting(true);
    try {
      if (payMethod === 'balance') {
        await ApiService.topup({ amount: numSend }).catch(() => {});
        setAvailableBalance((b) => b + numSend);
      }
      setReceiptVisible(false);
      Alert.alert(
        'Transfer Cancelled',
        `Full refund of ${source.symbol}${numSend.toFixed(2)} has been returned to your account.`,
        [{ text: 'OK', onPress: () => router.replace('/(tabs)') }],
      );
    } finally {
      setSubmitting(false);
    }
  };

  const formatCountdown = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <View style={styles.root}>
      {/* Pink Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          onPress={handleBack}
          style={styles.backBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={22} color="#111111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {step === 3 ? 'Review transfer' : 'Send Abroad'}
        </Text>
        <View style={{ width: 32 }} />
      </View>

      {/* 4-Step Progress Tabs */}
      <View style={styles.stepperWrap}>
        {STEPS.map((label, idx) => {
          const active = idx === step;
          const completed = idx <= step;
          return (
            <TouchableOpacity
              key={label}
              style={styles.stepItem}
              activeOpacity={0.7}
              onPress={() => {
                if (idx <= step) setStep(idx as Step);
              }}
            >
              <Text style={[styles.stepLabel, active && styles.stepLabelActive]}>
                {label}
              </Text>
              <View
                style={[
                  styles.stepBar,
                  completed ? styles.stepBarActive : styles.stepBarIdle,
                ]}
              />
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ════════════ STEP 1: QUOTE ════════════ */}
      {step === 0 && (
        <>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
          >
            {/* You Send Box */}
            <View style={[styles.currencyCard, insufficientFunds && styles.currencyCardError]}>
              <View style={styles.currencyLeft}>
                <Text style={styles.cardHint}>You send</Text>
                <TextInput
                  style={styles.amountInput}
                  keyboardType="numeric"
                  value={sendAmount}
                  onChangeText={(txt) => setSendAmount(txt.replace(/[^0-9.]/g, ''))}
                  placeholder="0"
                  placeholderTextColor="#9CA3AF"
                />
                <Text style={[styles.balanceSub, insufficientFunds && { color: '#DC2626' }]}>
                  {insufficientFunds
                    ? `Exceeds balance ($${availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })})`
                    : `Balance $${availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.currencyPill}
                activeOpacity={0.75}
                onPress={() => setCurrencyPickerTarget('source')}
              >
                <View style={styles.usdCircle}>
                  <Text style={styles.usdCircleText}>{source.symbol}</Text>
                </View>
                <Text style={styles.currencyCode}>{source.code}</Text>
                <Ionicons name="chevron-down" size={14} color="#4B5563" />
              </TouchableOpacity>
            </View>

            {/* Fee Breakdown Timeline */}
            <View style={styles.timeline}>
              <View style={styles.timelineLine} />

              <View style={styles.timelineRow}>
                <View style={styles.timelineDot}>
                  <Text style={styles.timelineSymbol}>−</Text>
                </View>
                <Text style={styles.timelineAmount}>
                  {source.symbol}
                  {totalFee.toFixed(2)}
                </Text>
                <Text style={styles.timelineLabel}>Total fees</Text>
                <TouchableOpacity onPress={() => setShowBreakdown(!showBreakdown)}>
                  <Text style={styles.breakdownLink}>
                    {showBreakdown ? 'Hide' : 'Breakdown'}
                  </Text>
                </TouchableOpacity>
              </View>

              {showBreakdown && (
                <View style={styles.breakdownBox}>
                  <Text style={styles.breakdownDetail}>
                    Low-cost transfer fee: {source.symbol}0.79 · Service fee: {source.symbol}0.20
                    {debitExtraFee > 0 ? ` · Card fee: ${source.symbol}${debitExtraFee.toFixed(2)}` : ''}
                  </Text>
                </View>
              )}

              <View style={styles.timelineRow}>
                <View style={styles.timelineDot}>
                  <Text style={styles.timelineSymbol}>=</Text>
                </View>
                <Text style={styles.timelineAmount}>
                  {source.symbol}
                  {converted.toFixed(2)}
                </Text>
                <Text style={styles.timelineLabel}>Amount we'll convert</Text>
              </View>

              <View style={styles.timelineRow}>
                <View style={styles.timelineDot}>
                  <Text style={styles.timelineSymbol}>×</Text>
                </View>
                <Text style={styles.timelineAmount}>{effectiveRate.toFixed(2)}</Text>
                <Text style={styles.timelineLabel}>Guaranteed rate (24h)</Text>
              </View>
            </View>

            {/* Recipient Gets Box */}
            <View style={styles.currencyCard}>
              <View style={styles.currencyLeft}>
                <Text style={styles.cardHint}>Recipient gets</Text>
                <Text style={styles.receiveValue}>{receiveFormatted}</Text>
                <Text style={styles.balanceSub}>
                  {dest.country}, {dest.name}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.currencyPill}
                activeOpacity={0.75}
                onPress={() => setCurrencyPickerTarget('dest')}
              >
                <View style={styles.destCircle}>
                  <Text style={styles.destCircleText}>{dest.symbol}</Text>
                </View>
                <Text style={styles.currencyCode}>{dest.code}</Text>
                <Ionicons name="chevron-down" size={14} color="#4B5563" />
              </TouchableOpacity>
            </View>

            {/* Arrival Estimate Banner */}
            <View style={styles.arrivalBanner}>
              <View style={styles.arrivalIconBox}>
                <Ionicons name="calendar-outline" size={18} color="#374151" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.arrivalTitle}>{arrivalText}</Text>
                <Text style={styles.arrivalSub}>{arrivalSub}</Text>
              </View>
            </View>

            {/* How should they receive it? */}
            <Text style={styles.sectionHeading}>How should they receive it?</Text>
            <View style={styles.deliveryRow}>
              <TouchableOpacity
                style={[styles.deliveryCard, delivery === 'bank' && styles.deliveryCardActive]}
                activeOpacity={0.8}
                onPress={() => setDelivery('bank')}
              >
                <Ionicons name="business-outline" size={20} color="#111111" />
                <Text style={styles.deliveryTitle}>Bank deposit</Text>
                <Text style={styles.deliverySub}>Any bank account</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.deliveryCard, delivery === 'wallet' && styles.deliveryCardActive]}
                activeOpacity={0.8}
                onPress={() => setDelivery('wallet')}
              >
                <Ionicons name="phone-portrait-outline" size={20} color="#111111" />
                <Text style={styles.deliveryTitle}>Mobile wallet</Text>
                <Text style={styles.deliverySub}>Arrives in seconds</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.deliveryCard, delivery === 'cash' && styles.deliveryCardActive]}
                activeOpacity={0.8}
                onPress={() => setDelivery('cash')}
              >
                <Ionicons name="storefront-outline" size={20} color="#111111" />
                <Text style={styles.deliveryTitle}>Cash pickup</Text>
                <Text style={styles.deliverySub}>Ready in minutes</Text>
              </TouchableOpacity>
            </View>

            {/* Savings Comparison */}
            <TouchableOpacity
              style={styles.savingsCard}
              activeOpacity={0.8}
              onPress={() =>
                Alert.alert(
                  'Payora Fee Comparison',
                  `Sending ${source.symbol}${numSend.toFixed(2)} ${source.code} to ${dest.code}:\n\n• Payora fee: ${source.symbol}${totalFee.toFixed(2)} at mid-market rate (${effectiveRate})\n• Typical bank wire: ~$15–$25 + 3.5% FX markup\n\nEstimated savings: ${dest.symbol}${savingsFormatted}`,
                )
              }
            >
              <Ionicons name="pricetag-outline" size={18} color="#374151" />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.savingsTitle}>
                  You save about {dest.symbol}
                  {savingsFormatted} vs. typical banks
                </Text>
                <Text style={styles.savingsSub}>
                  Mid-market rate, no hidden markup. See fees
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
            </TouchableOpacity>
          </ScrollView>

          <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 14) }]}>
            <TouchableOpacity
              style={[
                styles.primaryBtn,
                (invalidAmount || insufficientFunds) && styles.primaryBtnDisabled,
              ]}
              activeOpacity={0.85}
              disabled={invalidAmount || insufficientFunds}
              onPress={() => setStep(1)}
            >
              <Text style={styles.primaryBtnText}>Continue →</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* ════════════ STEP 2: RECIPIENT ════════════ */}
      {step === 1 && (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scroll, { paddingBottom: Math.max(insets.bottom, 24) }]}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.stepTitle}>Who are you sending to?</Text>

          <View style={styles.sendingBanner}>
            <Ionicons name="flash" size={14} color="#D97706" style={{ marginRight: 6 }} />
            <Text style={styles.sendingBannerText}>
              Sending {dest.symbol}
              {receiveFormatted} · {deliveryLabel}
            </Text>
          </View>

          {/* Search */}
          <View style={styles.searchBox}>
            <Ionicons name="search" size={16} color="#9CA3AF" style={{ marginRight: 8 }} />
            <TextInput
              style={styles.searchInput}
              placeholder="Name, email or account"
              placeholderTextColor="#9CA3AF"
              value={recipientQuery}
              onChangeText={setRecipientQuery}
            />
            {recipientQuery ? (
              <TouchableOpacity onPress={() => setRecipientQuery('')}>
                <Ionicons name="close-circle" size={18} color="#9CA3AF" />
              </TouchableOpacity>
            ) : null}
          </View>

          {/* Add new recipient */}
          <TouchableOpacity
            style={styles.recipientActionCard}
            activeOpacity={0.8}
            onPress={() => setAddModalVisible(true)}
          >
            <View style={styles.addCircle}>
              <Ionicons name="add" size={22} color={Colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.recName}>Add a new recipient</Text>
              <Text style={styles.recSub}>Bank account, mobile wallet or cash pickup</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
          </TouchableOpacity>

          {/* Myself */}
          <TouchableOpacity
            style={styles.recipientActionCard}
            activeOpacity={0.8}
            onPress={() => {
              setSelectedRecipient({
                id: 'myself',
                name: 'Myself',
                subtitle: `${deliveryLabel} · your account — ${dest.country}`,
                avatar: 'N',
                color: '#7CB89A',
                currency: dest.code,
              });
              setStep(2);
            }}
          >
            <View style={[styles.recAvatar, { backgroundColor: '#7CB89A' }]}>
              <Text style={styles.recAvatarText}>N</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.recName}>Myself</Text>
              <Text style={styles.recSub}>
                {deliveryLabel} · your account — {dest.country}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
          </TouchableOpacity>

          <Text style={styles.listGroupTitle}>Your recipients in {dest.country}</Text>

          {filteredRecipients.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.recipientActionCard}
              activeOpacity={0.8}
              onPress={() => {
                setSelectedRecipient(item);
                setStep(2);
              }}
            >
              <View style={[styles.recAvatar, { backgroundColor: item.color }]}>
                <Text style={styles.recAvatarText}>{item.avatar}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.recName}>{item.name}</Text>
                <Text style={styles.recSub}>{item.subtitle}</Text>
              </View>
              <View style={styles.currencyTag}>
                <Text style={styles.currencyTagText}>{dest.code}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* ════════════ STEP 3: PURPOSE ════════════ */}
      {step === 2 && (
        <>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
            <Text style={styles.stepTitle}>What's this transfer for?</Text>
            <Text style={styles.purposeSub}>
              International transfers to {dest.country} need a reason. It helps us and partner
              banks meet anti-money-laundering rules.
            </Text>

            <View style={styles.purposeList}>
              {PURPOSES.map((p) => {
                const selected = selectedPurpose === p.label;
                return (
                  <TouchableOpacity
                    key={p.id}
                    style={styles.purposeRow}
                    activeOpacity={0.75}
                    onPress={() => setSelectedPurpose(p.label)}
                  >
                    <Ionicons
                      name={p.icon}
                      size={20}
                      color="#374151"
                      style={{ marginRight: 14 }}
                    />
                    <Text style={styles.purposeLabel}>{p.label}</Text>
                    <View style={[styles.radioOuter, selected && styles.radioOuterActive]}>
                      {selected && <View style={styles.radioInner} />}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 14) }]}>
            <TouchableOpacity
              style={[styles.primaryBtn, !selectedPurpose && styles.primaryBtnDisabled]}
              activeOpacity={0.85}
              disabled={!selectedPurpose}
              onPress={() => setStep(3)}
            >
              <Text style={styles.primaryBtnText}>Continue →</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* ════════════ STEP 4: REVIEW ════════════ */}
      {step === 3 && (
        <>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
            {/* Purpose summary */}
            <View style={styles.purposeSummaryRow}>
              <View>
                <Text style={styles.purposeHint}>
                  To {selectedRecipient?.name || 'Ammu'} · {dest.symbol}
                  {receiveFormatted} {dest.code}
                </Text>
                <Text style={styles.purposeValue}>{selectedPurpose}</Text>
              </View>
              <TouchableOpacity onPress={() => setStep(2)}>
                <Text style={styles.editLink}>Edit</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.payWithTitle}>Pay with</Text>

            {/* Payora balance */}
            <TouchableOpacity
              style={[styles.payCard, payMethod === 'balance' && styles.payCardActive]}
              activeOpacity={0.8}
              onPress={() => setPayMethod('balance')}
            >
              <View style={styles.payIconBox}>
                <Ionicons name="wallet-outline" size={20} color="#111111" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.payTitle}>Payora {source.code} balance</Text>
                <Text style={styles.paySub}>
                  Available ${availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })} · Free
                </Text>
              </View>
              <View style={[styles.radioOuter, payMethod === 'balance' && styles.radioOuterActive]}>
                {payMethod === 'balance' && <View style={styles.radioInner} />}
              </View>
            </TouchableOpacity>

            {/* Bank transfer */}
            <TouchableOpacity
              style={[styles.payCard, payMethod === 'bank_transfer' && styles.payCardActive]}
              activeOpacity={0.8}
              onPress={() => setPayMethod('bank_transfer')}
            >
              <View style={styles.payIconBox}>
                <Ionicons name="business-outline" size={20} color="#111111" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.payTitle}>Bank transfer</Text>
                <Text style={styles.paySub}>
                  Bank transfer · 4821 · Free · adds about a day
                </Text>
              </View>
              <View
                style={[
                  styles.radioOuter,
                  payMethod === 'bank_transfer' && styles.radioOuterActive,
                ]}
              >
                {payMethod === 'bank_transfer' && <View style={styles.radioInner} />}
              </View>
            </TouchableOpacity>

            {/* Debit card */}
            <TouchableOpacity
              style={[styles.payCard, payMethod === 'debit' && styles.payCardActive]}
              activeOpacity={0.8}
              onPress={() => setPayMethod('debit')}
            >
              <View style={styles.payIconBox}>
                <Ionicons name="card-outline" size={20} color="#111111" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.payTitle}>Debit card</Text>
                <Text style={styles.paySub}>Visa ••••0157 · 0.7% fee · instant</Text>
              </View>
              <View style={[styles.radioOuter, payMethod === 'debit' && styles.radioOuterActive]}>
                {payMethod === 'debit' && <View style={styles.radioInner} />}
              </View>
            </TouchableOpacity>

            {/* KYC Warning Banner */}
            <TouchableOpacity
              style={styles.kycBox}
              activeOpacity={0.85}
              onPress={() => router.push('/kyc')}
            >
              <Ionicons
                name="shield-checkmark-outline"
                size={20}
                color="#B45309"
                style={{ marginRight: 10, marginTop: 2 }}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.kycTitle}>Verify your identity first</Text>
                <Text style={styles.kycSub}>
                  A one-time check required by law before your first international transfer. Takes
                  about 3 minutes.
                </Text>
              </View>
            </TouchableOpacity>

            {/* 30-minute cancel policy */}
            <View style={styles.cancelPolicyRow}>
              <Ionicons
                name="return-up-back-outline"
                size={18}
                color="#4B5563"
                style={{ marginRight: 10, marginTop: 2 }}
              />
              <Text style={styles.cancelPolicyText}>
                You can cancel for a full refund within 30 minutes of paying unless the money has
                already been picked up or deposited.
              </Text>
            </View>

            {/* Terms checkbox */}
            <TouchableOpacity
              style={styles.termsRow}
              activeOpacity={0.8}
              onPress={() => setAgreedTerms(!agreedTerms)}
            >
              <View style={[styles.checkbox, agreedTerms && styles.checkboxChecked]}>
                {agreedTerms && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
              </View>
              <Text style={styles.termsText}>
                I've read and agree to the{' '}
                <Text style={styles.termsLink}>Remittance Terms</Text> and confirm the recipient
                details are correct.
              </Text>
            </TouchableOpacity>
          </ScrollView>

          <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 14) }]}>
            <TouchableOpacity
              style={[
                styles.primaryBtn,
                (!agreedTerms || submitting) && styles.primaryBtnDisabled,
              ]}
              activeOpacity={0.85}
              disabled={!agreedTerms || submitting}
              onPress={() => {
                Alert.alert(
                  'Confirm International Transfer',
                  `Send ${source.symbol}${numSend.toFixed(2)} ${source.code} (${dest.symbol}${receiveFormatted} ${dest.code}) to ${selectedRecipient?.name || 'recipient'}?`,
                  [
                    { text: 'Verify KYC First', onPress: () => router.push('/kyc') },
                    { text: 'Send Now', onPress: executeTransfer },
                  ],
                );
              }}
            >
              {submitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryBtnText}>Verify identity to continue</Text>
              )}
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* Currency Picker Modal */}
      <Modal visible={currencyPickerTarget !== null} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {currencyPickerTarget === 'source' ? 'Send Currency' : 'Recipient Currency'}
              </Text>
              <TouchableOpacity onPress={() => setCurrencyPickerTarget(null)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {currencyPickerTarget === 'source'
              ? SOURCE_CURRENCIES.map((c, idx) => (
                  <TouchableOpacity
                    key={c.code}
                    style={[
                      styles.currencyOption,
                      idx === sourceIdx && styles.currencyOptionActive,
                    ]}
                    onPress={() => {
                      setSourceIdx(idx);
                      setCurrencyPickerTarget(null);
                    }}
                  >
                    <Text style={styles.currencyOptionCode}>
                      {c.symbol} {c.code}
                    </Text>
                    {idx === sourceIdx && (
                      <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
                    )}
                  </TouchableOpacity>
                ))
              : DEST_CURRENCIES.map((c, idx) => (
                  <TouchableOpacity
                    key={c.code}
                    style={[
                      styles.currencyOption,
                      idx === destIdx && styles.currencyOptionActive,
                    ]}
                    onPress={() => {
                      setDestIdx(idx);
                      setCurrencyPickerTarget(null);
                    }}
                  >
                    <View>
                      <Text style={styles.currencyOptionCode}>
                        {c.symbol} {c.code} — {c.country}
                      </Text>
                      <Text style={styles.currencyOptionSub}>{c.name}</Text>
                    </View>
                    {idx === destIdx && (
                      <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
                    )}
                  </TouchableOpacity>
                ))}
          </View>
        </View>
      </Modal>

      {/* Add New Recipient Modal */}
      <Modal visible={addModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Recipient</Text>
              <TouchableOpacity onPress={() => setAddModalVisible(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.modalInput}
              placeholder="Recipient full name"
              placeholderTextColor="#9CA3AF"
              value={newRecName}
              onChangeText={setNewRecName}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Account number / mobile wallet"
              placeholderTextColor="#9CA3AF"
              value={newRecAccount}
              onChangeText={setNewRecAccount}
            />

            <TouchableOpacity style={styles.primaryBtn} onPress={handleAddRecipient}>
              <Text style={styles.primaryBtnText}>Save & Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 30-Minute Cancel & Receipt Modal */}
      <Modal visible={receiptVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.receiptIcon}>
              <Ionicons name="checkmark-circle" size={56} color="#16A34A" />
            </View>
            <Text style={styles.receiptTitle}>Transfer Initiated!</Text>
            <Text style={styles.receiptSub}>
              {dest.symbol}
              {receiveFormatted} {dest.code} is on the way to {selectedRecipient?.name || 'Ammu'}
            </Text>

            <View style={styles.receiptMetaBox}>
              <Text style={styles.receiptMeta}>Reference: {txRef}</Text>
              <Text style={styles.receiptMeta}>
                Sent: {source.symbol}
                {numSend.toFixed(2)} {source.code} · {deliveryLabel}
              </Text>
              <Text style={styles.countdownText}>
                30-min full-refund window: {formatCountdown(cancelSeconds)}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={() => {
                setReceiptVisible(false);
                router.replace('/(tabs)');
              }}
            >
              <Text style={styles.primaryBtnText}>Back to Home</Text>
            </TouchableOpacity>

            {cancelSeconds > 0 && (
              <TouchableOpacity
                style={styles.cancelRefundBtn}
                disabled={submitting}
                onPress={handleCancelWithin30Min}
              >
                <Text style={styles.cancelRefundText}>Cancel Transfer (Full Refund)</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
  backBtn: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  stepperWrap: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 6,
    gap: 8,
    backgroundColor: '#FFFFFF',
  },
  stepItem: {
    flex: 1,
  },
  stepLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9CA3AF',
    marginBottom: 5,
  },
  stepLabelActive: {
    color: '#111111',
    fontWeight: '800',
  },
  stepBar: {
    height: 3,
    borderRadius: 2,
  },
  stepBarActive: {
    backgroundColor: Colors.primary,
  },
  stepBarIdle: {
    backgroundColor: '#E5E7EB',
  },
  scroll: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 20,
  },
  currencyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  currencyCardError: {
    borderColor: '#DC2626',
  },
  currencyLeft: {
    flex: 1,
  },
  cardHint: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 2,
  },
  amountInput: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111111',
    padding: 0,
    marginBottom: 2,
  },
  receiveValue: {
    fontSize: 26,
    fontWeight: '800',
    color: '#111111',
    marginBottom: 2,
  },
  balanceSub: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  currencyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 6,
  },
  usdCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  usdCircleText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  destCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#111111',
    justifyContent: 'center',
    alignItems: 'center',
  },
  destCircleText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  currencyCode: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111111',
  },
  timeline: {
    paddingVertical: 10,
    paddingLeft: 10,
    position: 'relative',
  },
  timelineLine: {
    position: 'absolute',
    left: 19,
    top: 18,
    bottom: 18,
    width: 1.5,
    backgroundColor: '#E5E7EB',
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  timelineDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  timelineSymbol: {
    fontSize: 11,
    fontWeight: '800',
    color: '#4B5563',
  },
  timelineAmount: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111111',
    marginRight: 6,
  },
  timelineLabel: {
    fontSize: 12,
    color: '#6B7280',
    flex: 1,
  },
  breakdownLink: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  breakdownBox: {
    marginLeft: 30,
    marginBottom: 4,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 8,
  },
  breakdownDetail: {
    fontSize: 11,
    color: '#6B7280',
  },
  arrivalBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E5F5F2',
    borderRadius: 14,
    padding: 12,
    marginTop: 12,
    marginBottom: 14,
  },
  arrivalIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  arrivalTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111111',
  },
  arrivalSub: {
    fontSize: 11,
    color: '#4B5563',
    marginTop: 1,
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111111',
    marginBottom: 10,
  },
  deliveryRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  deliveryCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 6,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  deliveryCardActive: {
    borderColor: Colors.primary,
    borderWidth: 1.5,
    backgroundColor: '#FDF2F6',
  },
  deliveryTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#111111',
    marginTop: 5,
    textAlign: 'center',
  },
  deliverySub: {
    fontSize: 9,
    color: '#6B7280',
    marginTop: 2,
    textAlign: 'center',
  },
  savingsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 12,
    backgroundColor: '#FFFFFF',
  },
  savingsTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111111',
  },
  savingsSub: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 2,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111111',
    marginBottom: 10,
  },
  sendingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF9E7',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginBottom: 14,
  },
  sendingBannerText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#78350F',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 14,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#111111',
  },
  recipientActionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ECEEF2',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    backgroundColor: '#FFFFFF',
  },
  addCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FCE8F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  recAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  recAvatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  recName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111111',
  },
  recSub: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  listGroupTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111111',
    marginTop: 8,
    marginBottom: 10,
  },
  currencyTag: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginRight: 6,
  },
  currencyTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#374151',
  },
  purposeSub: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 18,
    marginBottom: 16,
  },
  purposeList: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  purposeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  purposeLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#111111',
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOuterActive: {
    borderColor: Colors.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
  purposeSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    marginBottom: 16,
  },
  purposeHint: {
    fontSize: 11,
    color: '#9CA3AF',
    marginBottom: 2,
  },
  purposeValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111111',
  },
  editLink: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  payWithTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111111',
    marginBottom: 10,
  },
  payCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    backgroundColor: '#FFFFFF',
  },
  payCardActive: {
    borderColor: Colors.primary,
    borderWidth: 1.5,
    backgroundColor: '#FDF2F6',
  },
  payIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  payTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111111',
  },
  paySub: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  kycBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FEF3E6',
    borderRadius: 12,
    padding: 12,
    marginTop: 6,
    marginBottom: 14,
  },
  kycTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#92400E',
    marginBottom: 2,
  },
  kycSub: {
    fontSize: 11,
    color: '#92400E',
    lineHeight: 16,
  },
  cancelPolicyRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  cancelPolicyText: {
    flex: 1,
    fontSize: 11,
    color: '#6B7280',
    lineHeight: 16,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    marginTop: 1,
  },
  checkboxChecked: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  termsText: {
    flex: 1,
    fontSize: 11,
    color: '#4B5563',
    lineHeight: 16,
  },
  termsLink: {
    color: Colors.primary,
    textDecorationLine: 'underline',
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    backgroundColor: '#FFFFFF',
  },
  primaryBtn: {
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  primaryBtnDisabled: {
    backgroundColor: '#F4A6C1',
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 32,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111111',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 46,
    fontSize: 14,
    color: '#111111',
    marginBottom: 12,
  },
  currencyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginBottom: 6,
  },
  currencyOptionActive: {
    backgroundColor: '#FDF2F6',
  },
  currencyOptionCode: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111111',
  },
  currencyOptionSub: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  receiptIcon: {
    alignItems: 'center',
    marginBottom: 8,
  },
  receiptTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111111',
    textAlign: 'center',
    marginBottom: 6,
  },
  receiptSub: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  receiptMetaBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    padding: 14,
    marginBottom: 18,
    gap: 6,
  },
  receiptMeta: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '600',
  },
  countdownText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '700',
    marginTop: 4,
  },
  cancelRefundBtn: {
    marginTop: 10,
    height: 46,
    borderRadius: 23,
    borderWidth: 1.5,
    borderColor: '#DC2626',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelRefundText: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '700',
  },
});
