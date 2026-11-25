import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
  Alert,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/theme/colors';
import { ApiService, WalletAccount } from '../../src/services/api';
import { useAuth } from '../../src/context/AuthContext';

const { width } = Dimensions.get('window');

export default function MyPayoraScreen() {
  const router = useRouter();
  const { logout } = useAuth();
  const [accounts, setAccounts] = useState<WalletAccount[]>([]);
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [logoutDialogVisible, setLogoutDialogVisible] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      const data = await ApiService.getAccounts();
      setAccounts(data);
    } catch (e) {
      console.warn('Error fetching accounts:', e);
    }
  };

  const handleMakePrimary = (curr: string) => {
    setSelectedCurrency(curr);
    setAccounts((prev) =>
      prev.map((acc) => ({
        ...acc,
        isPrimary: acc.currency === curr,
      })),
    );
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    setLogoutError(null);
    try {
      await logout();
      setLogoutDialogVisible(false);
    } catch (error) {
      console.warn('Logout failed:', error);
      setLogoutError('Could not log out. Please try again.');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const favorites = [
    { id: '1', name: 'Mom', initial: 'M', color: '#81C784', phone: '+1 555 019 2831' },
    { id: '2', name: 'Sofia Marti..', initial: 'S', color: '#BA68C8', phone: '+1 555 018 7722' },
    { id: '3', name: 'Daniel Kim', initial: 'D', color: '#F06292', phone: '+1 555 014 9912' },
  ];

  return (
    <View style={styles.container}>
      {/* Top Half: Magenta Gradient Landscape */}
      <LinearGradient
        colors={['#E91E63', '#D81B60', '#C2185B']}
        style={styles.headerLandscape}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.8, y: 1 }}
      >
        <SafeAreaView edges={['top']} style={styles.safeArea}>
          {/* Top Bar with User Avatar, Name, 1 Year Pill, Search, and Logo Badge */}
          <View style={styles.topBar}>
            <View style={styles.userSection}>
              <Image
                source={{
                  uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
                }}
                style={styles.avatar}
              />
              <View style={styles.userInfo}>
                <Text style={styles.userName}>Noor Mohammad</Text>
                {/* 1 year with Payora Pill */}
                <View style={styles.loyaltyPill}>
                  <Ionicons name="calendar-outline" size={13} color={Colors.primary} style={{ marginRight: 4 }} />
                  <Text style={styles.loyaltyPillText}>1 year with Payora</Text>
                </View>
              </View>
            </View>

            <View style={styles.topRightActions}>
              <TouchableOpacity style={styles.headerIconButton} activeOpacity={0.7}>
                <Ionicons name="search" size={20} color="#FFFFFF" />
              </TouchableOpacity>

              <Image source={require("../../assets/payora.png")} style={styles.brandBadge} />
              <TouchableOpacity
                style={styles.logoutHeaderButton}
                accessibilityRole="button"
                accessibilityLabel="Log out"
                activeOpacity={0.7}
                onPress={() => {
                  setLogoutError(null);
                  setLogoutDialogVisible(true);
                }}
              >
                <Ionicons name="log-out-outline" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Decorative Landscape Elements */}
          <View style={styles.landscapeVector}>
            <View style={styles.landscapeHill1} />
            <View style={styles.landscapeHill2} />
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* Main Content Sheet with Rounded Top */}
      <View style={styles.sheetContainer}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Top Cards: Rewards and Savings */}
          <View style={styles.cardsRow}>
            {/* Reward Points Card */}
            <View style={styles.rewardCard}>
              <Text style={styles.cardHeader}>Reward points</Text>
              <View style={styles.pointsRow}>
                <Ionicons name="star" size={18} color="#111111" style={{ marginRight: 4 }} />
                <Text style={styles.pointsNumber}>4,367</Text>
              </View>
              <TouchableOpacity activeOpacity={0.7}>
                <Text style={styles.redeemLink}>Redeem</Text>
              </TouchableOpacity>
            </View>

            {/* Payora Savings Card */}
            <TouchableOpacity
              style={styles.savingsCard}
              activeOpacity={0.85}
              onPress={() => Alert.alert('Payora Savings', 'Earn 4.85% APY on USD and EUR savings with zero lockup.')}
            >
              <View style={styles.savingsTop}>
                <Text style={styles.savingsHeader}>Payora Savings</Text>
                <Text style={styles.savingsSub}>Save from $50 a month</Text>
              </View>
              <View style={styles.savingsBottom}>
                <Ionicons name="arrow-forward" size={16} color="#065F46" />
                <View style={styles.sproutIcon}>
                  <Ionicons name="leaf-outline" size={22} color="#059669" />
                </View>
              </View>
            </TouchableOpacity>
          </View>

          {/* Favorites: Send in one tap */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Favorites</Text>
            <Text style={styles.sectionSubtitle}>Send in one tap</Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.favoritesRow}
          >
            {favorites.map((fav) => (
              <TouchableOpacity
                key={fav.id}
                style={styles.favoriteItem}
                activeOpacity={0.7}
                onPress={() =>
                  router.push({
                    pathname: '/send/amount',
                    params: { name: fav.name, phone: fav.phone },
                  })
                }
              >
                <View style={[styles.favoriteAvatar, { backgroundColor: fav.color }]}>
                  <Text style={styles.favoriteInitial}>{fav.initial}</Text>
                </View>
                <Text style={styles.favoriteName} numberOfLines={1}>
                  {fav.name}
                </Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={styles.favoriteItem}
              activeOpacity={0.7}
              onPress={() => router.push('/send/pick')}
            >
              <View style={styles.addAvatar}>
                <Ionicons name="person-add-outline" size={20} color="#9CA3AF" />
              </View>
              <Text style={styles.addFavoriteText}>Add new</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.favoriteItem}
              activeOpacity={0.7}
              onPress={() => router.push('/send/pick')}
            >
              <View style={styles.addAvatar}>
                <Ionicons name="person-add-outline" size={20} color="#9CA3AF" />
              </View>
              <Text style={styles.addFavoriteText}>Add new</Text>
            </TouchableOpacity>
          </ScrollView>

          {/* Currency Wallets Section */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Currency wallets</Text>
            <Text style={styles.sectionSubtitle}>Tap one to make it primary</Text>
          </View>

          {/* Currency List */}
          <View style={styles.walletsList}>
            {accounts.map((wallet) => {
              const isSelected = wallet.currency === selectedCurrency || wallet.isPrimary;
              return (
                <TouchableOpacity
                  key={wallet.id}
                  style={[styles.walletCard, isSelected && styles.walletCardSelected]}
                  activeOpacity={0.8}
                  onPress={() => handleMakePrimary(wallet.currency)}
                >
                  <View style={styles.walletLeft}>
                    <View style={styles.walletFlagCircle}>
                      <Text style={styles.walletFlag}>{wallet.flag}</Text>
                    </View>
                    <View>
                      <Text style={styles.walletName}>{wallet.name}</Text>
                      <Text style={styles.walletCurrencySub}>
                        {wallet.isPrimary
                          ? `${wallet.currency} · spends first`
                          : `${wallet.currency}, 1 USD = ${wallet.rateToUsd} ${wallet.currency}`}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.walletRight}>
                    <Text style={styles.walletBalance}>{wallet.formattedBalance}</Text>
                    {wallet.isPrimary && (
                      <View style={styles.primaryBadge}>
                        <Text style={styles.primaryBadgeText}>Primary</Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </View>

      <Modal
        visible={logoutDialogVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setLogoutDialogVisible(false)}
      >
        <View style={styles.logoutModalOverlay}>
          <View style={styles.logoutModalCard}>
            <View style={styles.logoutModalIcon}>
              <Ionicons name="log-out-outline" size={25} color={Colors.primary} />
            </View>
            <Text style={styles.logoutModalTitle}>Log out of Payora?</Text>
            <Text style={styles.logoutModalMessage}>
              You will need to sign in again to access your account.
            </Text>
            {logoutError && <Text style={styles.logoutError}>{logoutError}</Text>}
            <View style={styles.logoutModalActions}>
              <TouchableOpacity
                style={styles.logoutCancelButton}
                disabled={isLoggingOut}
                onPress={() => setLogoutDialogVisible(false)}
              >
                <Text style={styles.logoutCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.logoutConfirmButton}
                disabled={isLoggingOut}
                onPress={handleLogout}
              >
                {isLoggingOut ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.logoutConfirmText}>Log out</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerLandscape: {
    paddingBottom: 24,
    position: 'relative',
    overflow: 'hidden',
  },
  safeArea: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    marginRight: 10,
  },
  userInfo: {
    justifyContent: 'center',
  },
  userName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  loyaltyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  loyaltyPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#111111',
  },
  topRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  logoutHeaderButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  brandBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandBadgeText: {
    color: '#111111',
    fontSize: 20,
    fontWeight: '900',
  },
  landscapeVector: {
    height: 30,
    marginTop: 10,
  },
  landscapeHill1: {
    position: 'absolute',
    bottom: -15,
    left: -20,
    width: 240,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  landscapeHill2: {
    position: 'absolute',
    bottom: -20,
    right: -10,
    width: 260,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  sheetContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -16,
    paddingTop: 16,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 28,
  },
  cardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  rewardCard: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 18,
    padding: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  cardHeader: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 8,
  },
  pointsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  pointsNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111111',
  },
  redeemLink: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  savingsCard: {
    flex: 1,
    backgroundColor: '#ECFDF5',
    borderRadius: 18,
    padding: 16,
    marginLeft: 8,
    justifyContent: 'space-between',
  },
  savingsTop: {
    marginBottom: 8,
  },
  savingsHeader: {
    fontSize: 12,
    color: '#065F46',
    fontWeight: '700',
    marginBottom: 4,
  },
  savingsSub: {
    fontSize: 12,
    color: '#047857',
    fontWeight: '600',
    lineHeight: 16,
  },
  savingsBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  sproutIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#D1FAE5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111111',
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  favoritesRow: {
    flexDirection: 'row',
    paddingBottom: 20,
  },
  favoriteItem: {
    alignItems: 'center',
    marginRight: 16,
    width: 60,
  },
  favoriteAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  favoriteInitial: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  favoriteName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#4B5563',
    textAlign: 'center',
  },
  addAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  addFavoriteText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  walletsList: {
    marginTop: 4,
  },
  walletCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: '#FAFAFA',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  walletCardSelected: {
    backgroundColor: '#FFFFFF',
    borderColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  walletLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  walletFlagCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  walletFlag: {
    fontSize: 22,
  },
  walletName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111111',
  },
  walletCurrencySub: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  walletRight: {
    alignItems: 'flex-end',
  },
  walletBalance: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111111',
  },
  logoutModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.48)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  logoutModalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 24,
    alignItems: 'center',
  },
  logoutModalIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FCE7EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  logoutModalTitle: {
    color: '#111111',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 8,
  },
  logoutModalMessage: {
    color: '#6B7280',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 16,
  },
  logoutError: {
    color: '#B91C1C',
    fontSize: 13,
    marginBottom: 12,
    textAlign: 'center',
  },
  logoutModalActions: {
    flexDirection: 'row',
    width: '100%',
    marginTop: 4,
  },
  logoutCancelButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  logoutCancelText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '700',
  },
  logoutConfirmButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  logoutConfirmText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  primaryBadge: {
    backgroundColor: '#FCE7EB',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 4,
  },
  primaryBadgeText: {
    color: Colors.primary,
    fontSize: 10,
    fontWeight: '700',
  },
});
