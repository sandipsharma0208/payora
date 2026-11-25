import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import * as Haptics from 'expo-haptics';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Colors } from '../../src/theme/colors';
import { ApiService } from '../../src/services/api';

export default function PressHoldScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const name = (params.name as string) || 'Sofia Martínez';
  const phone = (params.phone as string) || '+1 555 018 7722';
  const amount = (params.amount as string) || '45.00';
  const note = (params.note as string) || '';
  const greetingCard = (params.greetingCard as string) || 'Send Money';
  const pin = (params.pin as string) || '12345';

  const [isHolding, setIsHolding] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successData, setSuccessData] = useState<any | null>(null);
  const [shareStatus, setShareStatus] = useState('');

  const holdAnim = useRef(new Animated.Value(0)).current;

  const triggerHaptic = (style: Haptics.ImpactFeedbackStyle) => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(style);
      } catch (e) {}
    }
  };

  const handlePressIn = () => {
    if (isProcessing || successData) return;
    setIsHolding(true);
    triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);

    Animated.timing(holdAnim, {
      toValue: 1,
      duration: 1800,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished) {
        onHoldComplete();
      }
    });
  };

  const handlePressOut = () => {
    if (isProcessing || successData) return;
    setIsHolding(false);
    Animated.spring(holdAnim, {
      toValue: 0,
      friction: 6,
      tension: 40,
      useNativeDriver: false,
    }).start();
  };

  const onHoldComplete = async () => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Heavy);
    setIsProcessing(true);

    try {
      const res = await ApiService.sendTransfer({
        recipientPhoneOrId: phone,
        amount: parseFloat(amount),
        currency: 'USD',
        note: note || greetingCard,
        pin,
      });
      setSuccessData(res);
      triggerHaptic(Haptics.ImpactFeedbackStyle.Heavy);
    } catch (err: any) {
      alert(err.message || 'Payment execution failed');
      setIsProcessing(false);
      holdAnim.setValue(0);
    }
  };

  const progressScale = holdAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.2, 1],
  });

  const transferAmount = Number.parseFloat(amount);
  const defaultBalanceAfterTransfer = Math.max(0, 2458.5 - transferAmount);
  const balanceAfterTransfer = Number.isFinite(Number(successData?.newBalance))
    ? Number(successData.newBalance)
    : defaultBalanceAfterTransfer;
  const formatMoney = (value: number) =>
    `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const handleShareReceipt = async () => {
    const referenceId = successData?.referenceId || 'TX858IWC2H';
    const receiptMessage = [
      'Payora payment receipt',
      `Amount: ${formatMoney(transferAmount)}`,
      `To: ${name}`,
      `Details: ${phone}`,
      `Charge: Free`,
      `Transaction ID: ${referenceId}`,
      `New balance: ${formatMoney(balanceAfterTransfer)}`,
      `Date: ${new Date().toLocaleString()}`,
    ].join('\n');
    try {
      if (Platform.OS === 'web') {
        const browserNavigator =
          typeof navigator === 'undefined'
            ? undefined
            : (navigator as typeof navigator & {
                share?: (data: { title: string; text: string }) => Promise<void>;
                clipboard?: { writeText: (text: string) => Promise<void> };
              });

        if (browserNavigator?.share) {
          try {
            await browserNavigator.share({ title: 'Payora receipt', text: receiptMessage });
            setShareStatus('Receipt shared successfully.');
            return;
          } catch (error) {
            if (error instanceof Error && error.name === 'AbortError') {
              throw error;
            }
            if (!browserNavigator.clipboard?.writeText) {
              throw error;
            }
          }
        }

        if (browserNavigator?.clipboard?.writeText) {
          await browserNavigator.clipboard.writeText(receiptMessage);
          setShareStatus('Receipt details copied to clipboard.');
          return;
        }

        throw new Error('Sharing and clipboard access are unavailable in this browser.');
      }

      if (!(await Sharing.isAvailableAsync())) {
        throw new Error('Expo Sharing is unavailable on this device.');
      }

      const cacheDirectory = FileSystem.cacheDirectory;
      if (!cacheDirectory) {
        throw new Error('A temporary directory is unavailable for the receipt.');
      }

      const safeReferenceId = String(referenceId).replace(/[^a-zA-Z0-9_-]/g, '_');
      const receiptUri = `${cacheDirectory}payora-receipt-${safeReferenceId}.txt`;
      await FileSystem.writeAsStringAsync(receiptUri, receiptMessage, {
        encoding: FileSystem.EncodingType.UTF8,
      });
      await Sharing.shareAsync(receiptUri, {
        dialogTitle: 'Share Payora receipt',
        mimeType: 'text/plain',
        UTI: 'public.plain-text',
      });
      setShareStatus('Receipt shared successfully.');
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        setShareStatus('Sharing canceled.');
        return;
      }
      console.warn('Unable to share transfer receipt:', error);
      setShareStatus('Unable to share receipt. Please try again.');
    }
  };

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <StatusBar
        style={successData ? 'light' : 'dark'}
        backgroundColor={successData ? Colors.primary : '#FFFFFF'}
      />
      <View style={styles.screenContent}>
        <View style={styles.header}>
          <View style={styles.headerSide} />
          <Text style={styles.headerTitle}>Confirm to Send Money</Text>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.headerSide}
            accessibilityRole="button"
            accessibilityLabel="Close confirmation"
            disabled={isProcessing}
          >
            <Ionicons name="close" size={20} color="#111827" />
          </TouchableOpacity>
        </View>

        <View style={styles.transferDetails}>
          <View style={styles.recipientRow}>
            <View style={styles.recipientAvatar}>
              <Text style={styles.avatarText}>{name[0]}</Text>
            </View>
            <View style={styles.recipientMeta}>
              <Text style={styles.recipientName}>{name}</Text>
              <Text style={styles.recipientPhone}>{phone} · on Payora</Text>
            </View>
            <Text style={styles.favoriteTag}>Favorites</Text>
          </View>

          <View style={styles.summaryRow}>
            <View>
              <Text style={styles.summaryLabel}>Total</Text>
              <Text style={styles.summaryValue}>{formatMoney(transferAmount)}</Text>
            </View>
            <View style={styles.summaryRight}>
              <Text style={styles.summaryLabel}>New Balance</Text>
              <Text style={styles.summaryValue}>{formatMoney(balanceAfterTransfer)}</Text>
            </View>
          </View>

          <View style={styles.referenceRow}>
            <Text style={styles.summaryLabel}>Reference</Text>
            <Text style={styles.referenceValue}>{note || '—'}</Text>
          </View>

          <View style={styles.greetingRow}>
            <Text style={styles.summaryLabel}>Greeting Card</Text>
            <View style={styles.greetingCard}>
              <Ionicons name="gift-outline" size={15} color={Colors.primary} />
              <Text style={styles.greetingText}>{greetingCard}</Text>
            </View>
          </View>
        </View>

        <View style={styles.holdPanel}>
          <TouchableOpacity
            activeOpacity={1}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={isProcessing || !!successData}
            style={styles.holdCircle}
          >
            <Animated.View
              style={[styles.holdCircleProgress, { transform: [{ scale: progressScale }] }]}
            />
            {isProcessing ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.payoraMark}>b</Text>
            )}
          </TouchableOpacity>
          <Text style={styles.holdInstruction}>
            {isHolding ? 'Keep holding...' : 'Tap and hold for Send Money'}
          </Text>
        </View>
      </View>

      <Modal visible={!!successData} animationType="fade" onRequestClose={() => setSuccessData(null)}>
        <SafeAreaView style={styles.successScreen}>
          <View style={styles.successHero}>
            <View style={styles.checkCircle}>
              <Ionicons name="checkmark" size={30} color={Colors.primary} />
            </View>
            <Text style={styles.successTitle}>Money sent</Text>
            <Text style={styles.successAmount}>{formatMoney(transferAmount)}</Text>
          </View>
          <View style={styles.receiptCard}>
            <ReceiptRow label="To" value={name} />
            <ReceiptRow label="Details" value={phone} />
            <ReceiptRow label="Tx ID" value={successData?.referenceId || 'TX858IWC2H'} />
            <ReceiptRow label="Time" value={new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} />
            <ReceiptRow label="Charge" value="Free" />
            <ReceiptRow label="New balance" value={formatMoney(balanceAfterTransfer)} />
          </View>
          <View style={styles.successActions}>
            <View style={styles.successActionButtons}>
              <TouchableOpacity style={styles.shareButton} onPress={handleShareReceipt}>
                <Ionicons name="share-outline" size={15} color={Colors.primary} />
                <Text style={styles.shareButtonText}>Share receipt</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.doneButton}
                onPress={() => {
                  setSuccessData(null);
                  router.replace('/(tabs)');
                }}
              >
                <Text style={styles.doneButtonText}>Back to Home</Text>
              </TouchableOpacity>
            </View>
            {shareStatus ? <Text style={styles.shareStatus}>{shareStatus}</Text> : null}
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

function ReceiptRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.receiptRow}>
      <Text style={styles.receiptLabel}>{label}</Text>
      <Text style={styles.receiptValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  screenContent: {
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
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
  },
  recipientName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111111',
    marginBottom: 1,
  },
  recipientPhone: {
    fontSize: 10,
    color: '#6B7280',
  },
  checkCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  successTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  successAmount: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  receiptValue: {
    maxWidth: '65%',
    color: '#111827',
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'right',
  },
  successScreen: {
    flex: 1,
    backgroundColor: '#F8F5F7',
  },
  successHero: {
    minHeight: 205,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingTop: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  receiptCard: {
    marginHorizontal: 16,
    marginTop: -14,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 6,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  receiptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 34,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  receiptLabel: {
    color: '#6B7280',
    fontSize: 10,
  },
  successActions: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    marginTop: 'auto',
  },
  successActionButtons: {
    flexDirection: 'row',
  },
  shareStatus: {
    color: '#4B5563',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 8,
  },
  shareButton: {
    flex: 1,
    height: 40,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: Colors.primary,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  shareButtonText: {
    color: Colors.primary,
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 4,
  },
  doneButton: {
    flex: 1,
    height: 40,
    borderRadius: 9,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
  },
  doneButtonText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  headerSide: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  transferDetails: {
    paddingHorizontal: 16,
  },
  recipientRow: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ECEEF2',
  },
  recipientAvatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#8FC49A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 7,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  recipientMeta: {
    flex: 1,
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
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ECEEF2',
  },
  summaryRight: {
    alignItems: 'flex-end',
  },
  summaryLabel: {
    fontSize: 9,
    color: '#6B7280',
    marginBottom: 3,
  },
  summaryValue: {
    fontSize: 11,
    fontWeight: '700',
    color: '#111827',
  },
  referenceRow: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ECEEF2',
  },
  referenceValue: {
    fontSize: 10,
    color: '#111827',
    marginTop: 2,
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  greetingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: '#FCE7EB',
  },
  greetingText: {
    color: '#111827',
    fontSize: 9,
    marginLeft: 5,
  },
  holdPanel: {
    height: 220,
    marginTop: 'auto',
    backgroundColor: Colors.primary,
    borderTopLeftRadius: 180,
    borderTopRightRadius: 180,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 24,
  },
  holdCircle: {
    width: 62,
    height: 62,
    borderRadius: 31,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.65)',
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  holdCircleProgress: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.28)',
  },
  payoraMark: {
    color: '#FFFFFF',
    fontSize: 25,
    fontWeight: '800',
    zIndex: 1,
  },
  holdInstruction: {
    color: '#FFFFFF',
    fontSize: 10,
    marginTop: 12,
  },
});
