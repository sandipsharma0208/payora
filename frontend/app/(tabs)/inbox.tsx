import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Modal,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '../../src/theme/colors';
import { ApiService, TransactionItem } from '../../src/services/api';

export default function InboxScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'transactions' | 'notifications'>('transactions');
  const [searchQuery, setSearchQuery] = useState('');
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [selectedTx, setSelectedTx] = useState<TransactionItem | null>(null);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      const data = await ApiService.getTransactions();
      setTransactions(data);
    } catch (e) {
      console.warn('Error loading transactions:', e);
    }
  };

  const filteredTransactions = transactions.filter((t) => {
    const q = searchQuery.toLowerCase();
    return (
      t.description.toLowerCase().includes(q) ||
      t.referenceId.toLowerCase().includes(q)
    );
  });

  const getTxIcon = (type: string) => {
    switch (type) {
      case 'WITHDRAW':
        return { name: 'cash-outline', color: '#0288D1', bg: '#E1F5FE' };
      case 'ADD_MONEY':
        return { name: 'wallet-outline', color: '#10B981', bg: '#D1FAE5' };
      case 'TRANSFER':
        return { name: 'arrow-down-circle-outline', color: '#8B5CF6', bg: '#EDE9FE' };
      case 'MOBILE_TOPUP':
        return { name: 'phone-portrait-outline', color: '#F59E0B', bg: '#FEF3C7' };
      default:
        return { name: 'globe-outline', color: '#E91E63', bg: '#FCE7EB' };
    }
  };

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <View style={styles.screenContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)'))}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Inbox</Text>
          <Image source={require("../../assets/payora.png")} style={styles.brandBadge} />
        </View>

      {/* Tabs: Transactions / Notifications */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'transactions' && styles.tabItemActive]}
          onPress={() => setActiveTab('transactions')}
        >
          <Text
            style={[styles.tabText, activeTab === 'transactions' && styles.tabTextActive]}
          >
            Transactions
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'notifications' && styles.tabItemActive]}
          onPress={() => setActiveTab('notifications')}
        >
          <View style={styles.tabBadgeRow}>
            <Text
              style={[styles.tabText, activeTab === 'notifications' && styles.tabTextActive]}
            >
              Notifications
            </Text>
            <View style={styles.notifBadge}>
              <Text style={styles.notifBadgeText}>1</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      {activeTab === 'transactions' ? (
        <View style={styles.content}>
          {/* Search Bar & Filter */}
          <View style={styles.searchRow}>
            <View style={styles.searchInputContainer}>
              <Ionicons name="search" size={18} color="#9CA3AF" style={{ marginRight: 8 }} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search by TrxID or number"
                placeholderTextColor="#9CA3AF"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            <TouchableOpacity style={styles.filterButton} activeOpacity={0.7}>
              <Ionicons name="options-outline" size={18} color="#4B5563" style={{ marginRight: 4 }} />
              <Text style={styles.filterText}>Filter</Text>
            </TouchableOpacity>
          </View>

          {/* Section Title */}
          <Text style={styles.sectionTitle}>Transactions from the last 90 days</Text>

          {/* Transaction List */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.txList}
          >
            {filteredTransactions.map((tx) => {
              const iconInfo = getTxIcon(tx.type);
              const isPositive = tx.amount > 0;
              return (
                <TouchableOpacity
                  key={tx.id}
                  style={styles.txItem}
                  activeOpacity={0.7}
                  onPress={() => setSelectedTx(tx)}
                >
                  <View style={[styles.txIconCircle, { backgroundColor: iconInfo.bg }]}>
                    <Ionicons name={iconInfo.name as any} size={22} color={iconInfo.color} />
                  </View>

                  <View style={styles.txDetails}>
                    <Text style={styles.txDesc} numberOfLines={1}>
                      {tx.description}
                    </Text>
                    <Text style={styles.txRef}>TrxID {tx.referenceId}</Text>
                  </View>

                  <View style={styles.txAmountContainer}>
                    <Text
                      style={[
                        styles.txAmount,
                        isPositive ? styles.txAmountPositive : styles.txAmountNegative,
                      ]}
                    >
                      {tx.formattedAmount}
                    </Text>
                    <Text style={styles.txTime}>
                      {new Date(tx.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      ) : (
        /* Notifications Tab */
        <View style={styles.notificationsContainer}>
          <View style={styles.notificationCard}>
            <View style={styles.notifIconCircle}>
              <Ionicons name="shield-checkmark" size={20} color={Colors.primary} />
            </View>
            <View style={styles.notifContent}>
              <Text style={styles.notifTitle}>Security Alert: Face ID Active</Text>
              <Text style={styles.notifBody}>
                Biometric hardware authentication is successfully protecting your multi-currency Payora wallet.
              </Text>
              <Text style={styles.notifTimestamp}>2 hours ago</Text>
            </View>
          </View>
        </View>
      )}

      {/* Transaction Details Modal */}
      <Modal visible={!!selectedTx} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalTopBar}>
              <Text style={styles.modalHeading}>Transaction Details</Text>
              <TouchableOpacity onPress={() => setSelectedTx(null)}>
                <Ionicons name="close-circle-outline" size={26} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {selectedTx && (
              <View style={styles.modalBody}>
                <View style={styles.receiptAmountRow}>
                  <Text
                    style={[
                      styles.receiptAmount,
                      selectedTx.amount > 0 ? styles.txAmountPositive : styles.txAmountNegative,
                    ]}
                  >
                    {selectedTx.formattedAmount}
                  </Text>
                  <View style={styles.receiptStatusBadge}>
                    <Text style={styles.receiptStatusText}>{selectedTx.status}</Text>
                  </View>
                </View>

                <View style={styles.receiptDetailsCard}>
                  <View style={styles.receiptRow}>
                    <Text style={styles.receiptLabel}>Description</Text>
                    <Text style={styles.receiptValue}>{selectedTx.description}</Text>
                  </View>
                  <View style={styles.receiptDivider} />
                  <View style={styles.receiptRow}>
                    <Text style={styles.receiptLabel}>Transaction Reference</Text>
                    <Text style={styles.receiptValue}>{selectedTx.referenceId}</Text>
                  </View>
                  <View style={styles.receiptDivider} />
                  <View style={styles.receiptRow}>
                    <Text style={styles.receiptLabel}>Ledger Type</Text>
                    <Text style={styles.receiptValue}>Double-Entry Balanced</Text>
                  </View>
                  <View style={styles.receiptDivider} />
                  <View style={styles.receiptRow}>
                    <Text style={styles.receiptLabel}>Date & Time</Text>
                    <Text style={styles.receiptValue}>
                      {new Date(selectedTx.createdAt).toLocaleString()}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.repeatButton}
                  onPress={() => {
                    setSelectedTx(null);
                    router.push('/send/pick');
                  }}
                >
                  <Ionicons name="repeat-outline" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                  <Text style={styles.repeatButtonText}>Repeat Transaction</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
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
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  brandBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
  },
  brandBadgeText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingHorizontal: 20,
  },
  tabItem: {
    paddingVertical: 12,
    marginRight: 24,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabItemActive: {
    borderBottomColor: Colors.primary,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  tabTextActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  tabBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notifBadge: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
  },
  notifBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#111111',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 14,
    height: 44,
    borderRadius: 14,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  sectionTitle: {
    fontSize: 13,
    color: '#9CA3AF',
    fontWeight: '600',
    marginBottom: 12,
  },
  txList: {
    paddingBottom: 24,
  },
  txItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
  },
  txIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  txDetails: {
    flex: 1,
  },
  txDesc: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 2,
  },
  txRef: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  txAmountContainer: {
    alignItems: 'flex-end',
  },
  txAmount: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  txAmountPositive: {
    color: '#10B981',
  },
  txAmountNegative: {
    color: '#EF4444',
  },
  txTime: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  notificationsContainer: {
    padding: 20,
  },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  notifIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FCE7EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notifContent: {
    flex: 1,
  },
  notifTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111111',
    marginBottom: 4,
  },
  notifBody: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
    marginBottom: 6,
  },
  notifTimestamp: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
  },
  modalTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalHeading: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111111',
  },
  modalBody: {
    alignItems: 'center',
  },
  receiptAmountRow: {
    alignItems: 'center',
    marginBottom: 20,
  },
  receiptAmount: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 6,
  },
  receiptStatusBadge: {
    backgroundColor: '#DEF7EC',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
  },
  receiptStatusText: {
    color: '#03543F',
    fontSize: 11,
    fontWeight: '700',
  },
  receiptDetailsCard: {
    width: '100%',
    backgroundColor: '#F9FAFB',
    borderRadius: 18,
    padding: 16,
    marginBottom: 20,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  receiptDivider: {
    height: 1,
    backgroundColor: '#ECEEF2',
  },
  receiptLabel: {
    fontSize: 13,
    color: '#6B7280',
  },
  receiptValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111111',
  },
  repeatButton: {
    width: '100%',
    height: 52,
    borderRadius: 26,
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
  repeatButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
