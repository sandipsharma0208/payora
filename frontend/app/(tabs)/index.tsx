import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/theme/colors';
import { ApiService, WalletAccount } from '../../src/services/api';

export default function HomeScreen() {
  const router = useRouter();
  const [balanceVisible, setBalanceVisible] = useState(false);
  const [accounts, setAccounts] = useState<WalletAccount[]>([]);
  const [seeMoreOpen, setSeeMoreOpen] = useState(false);
  const [activePromo, setActivePromo] = useState(0);
  const [promoWidth, setPromoWidth] = useState(0);
  const promoCarouselRef = useRef<ScrollView>(null);
  const previousPromoWidth = useRef(0);
  const { width: screenWidth } = useWindowDimensions();
  const slideWidth = promoWidth || Math.max(screenWidth - 32, 1);

  useEffect(() => {
    if (promoWidth > 0 && promoWidth !== previousPromoWidth.current) {
      if (previousPromoWidth.current > 0) {
        promoCarouselRef.current?.scrollTo({
          x: activePromo * promoWidth,
          animated: false,
        });
      }
      previousPromoWidth.current = promoWidth;
    }
  }, [activePromo, promoWidth]);

  useEffect(() => {
    loadWallet();
  }, []);

  const loadWallet = async () => {
    try {
      const data = await ApiService.getAccounts();
      setAccounts(data);
    } catch (e) {
      console.warn('Error loading accounts:', e);
    }
  };

  const primaryBalance = accounts.find((a) => a.isPrimary)?.formattedBalance || '$2,458.50';

  const actionItems = [
    {
      id: 'send',
      label: 'Send Money',
      icon: 'arrow-forward-circle-outline',
      color: '#E91E63',
      bgColor: '#FDE8EE',
      onPress: () => router.push('/send/pick'),
    },
    {
      id: 'send-abroad',
      label: 'Send Abroad',
      icon: 'globe-outline',
      color: '#0288D1',
      bgColor: '#E1F5FE',
      onPress: () => router.push('/send-abroad'),
    },
    {
      id: 'exchange',
      label: 'Exchange',
      icon: 'swap-horizontal',
      color: '#00897B',
      bgColor: '#E0F2F1',
      onPress: () => router.push('/(tabs)/my-payora'),
    },
    {
      id: 'pay',
      label: 'Pay',
      icon: 'bag-handle-outline',
      color: '#F57C00',
      bgColor: '#FFF3E0',
      onPress: () => router.push('/(tabs)/scan-qr'),
    },
    {
      id: 'add-money',
      label: 'Add Money',
      icon: 'wallet-outline',
      color: '#7B1FA2',
      bgColor: '#F3E5F5',
      onPress: () => router.push('/(tabs)/my-payora'),
    },
    {
      id: 'withdraw',
      label: 'Withdraw',
      icon: 'cash-outline',
      color: '#00838F',
      bgColor: '#E0F7FA',
      onPress: () => router.push('/(tabs)/my-payora'),
    },
    {
      id: 'mobile-topup',
      label: 'Mobile Top-up',
      icon: 'phone-portrait-outline',
      color: '#2E7D32',
      bgColor: '#E8F5E9',
      onPress: () => router.push('/send/pick'),
    },
    {
      id: 'pay-bills',
      label: 'Pay Bills',
      icon: 'bulb-outline',
      color: '#388E3C',
      bgColor: '#E8F5E9',
      onPress: () => router.push('/(tabs)/my-payora'),
    },
  ];

  const extraActionItems = [
    {
      id: 'travel',
      label: 'Travel',
      icon: 'airplane-outline',
      color: '#00897B',
      bgColor: '#E0F2F1',
      onPress: () => router.push('/send-abroad'),
    },
    {
      id: 'cards',
      label: 'Cards',
      icon: 'card-outline',
      color: '#5E35B1',
      bgColor: '#EDE7F6',
      onPress: () => router.push('/(tabs)/my-payora'),
    },
    {
      id: 'savings',
      label: 'Savings',
      icon: 'pie-chart-outline',
      color: '#F57C00',
      bgColor: '#FFF3E0',
      onPress: () => router.push('/(tabs)/my-payora'),
    },
    {
      id: 'activity',
      label: 'Activity',
      icon: 'time-outline',
      color: '#D81B60',
      bgColor: '#FCE4EC',
      onPress: () => router.push('/(tabs)/inbox'),
    },
  ];

  const promoItems = [
    {
      id: 'abroad',
      title: 'Send abroad at the real exchange rate',
      subtitle: 'Low, upfront fee to 60+ countries',
      link: 'Send abroad',
      icon: 'globe-outline',
      backgroundColor: '#E3F5F2',
      circleColor: '#C8ECE7',
      iconColor: '#1E293B',
      onPress: () => router.push('/send-abroad'),
    },
    {
      id: 'savings',
      title: 'Make your money work harder',
      subtitle: 'Explore Payora savings options',
      link: 'View savings',
      icon: 'leaf-outline',
      backgroundColor: '#ECFDF5',
      circleColor: '#D1FAE5',
      iconColor: '#059669',
      onPress: () => router.push('/(tabs)/my-payora'),
    },
    {
      id: 'security',
      title: 'Get more from your Payora account',
      subtitle: 'Complete verification for more features',
      link: 'Verify account',
      icon: 'shield-checkmark-outline',
      backgroundColor: '#EFF6FF',
      circleColor: '#DBEAFE',
      iconColor: '#2563EB',
      onPress: () => router.push('/kyc'),
    },
  ] as const;

  return (
    <View style={styles.container}>
      {/* Top Half: Magenta Gradient Landscape Header */}
      <LinearGradient
        colors={['#E91E63', '#D81B60', '#C2185B']}
        style={styles.headerLandscape}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.9, y: 1 }}
      >
        <SafeAreaView edges={['top']} style={styles.safeArea}>
          {/* Top Bar with User Avatar, Name, Search, and Logo Badge */}
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
                {/* Tap for Balance Pill */}
                <TouchableOpacity
                  style={styles.balancePill}
                  activeOpacity={0.8}
                  onPress={() => setBalanceVisible(!balanceVisible)}
                >
                  <View style={styles.balanceIconCircle}>
                    <Text style={styles.balanceCoinSymbol}>৳</Text>
                  </View>
                  <Text style={styles.balancePillText}>
                    {balanceVisible ? primaryBalance : 'Tap for Balance'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.topRightActions}>
              <TouchableOpacity
                style={styles.headerIconButton}
                activeOpacity={0.8}
                onPress={() => router.push('/ai-support')}
              >
                <Ionicons name="search" size={20} color="#111111" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.brandIconWrapper}
                activeOpacity={0.8}
                onPress={() => router.push('/(tabs)/inbox')}
              >
                <Image source={require("../../assets/payora.png")} style={styles.brandBadge} />
                <View style={styles.notificationBubble}>
                  <Text style={styles.notificationBubbleText}>5</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Artistic Landscape with Hills, Sun, Clouds & Houses matching Screenshot */}
          <View style={styles.landscapeCanvas}>
            {/* Soft Sun in Background */}
            <View style={styles.sunCircle} />

            {/* Subtle Clouds */}
            <View style={styles.cloud1} />

            {/* Back Rolling Hill */}
            <View style={styles.hillBack} />

            {/* Left Village Cottage */}
            <View style={styles.houseLeft}>
              <View style={styles.houseRoof} />
              <View style={styles.houseBody}>
                <View style={styles.houseWindow} />
                <View style={styles.houseDoor} />
              </View>
            </View>

            {/* Front Rolling Hill */}
            <View style={styles.hillFront} />

            {/* Right Cottage & Tree */}
            <View style={styles.houseRight}>
              <View style={styles.houseRoofRight} />
              <View style={styles.houseBodyRight}>
                <View style={styles.houseWindow} />
              </View>
            </View>
            <View style={styles.treeRight}>
              <View style={styles.treeCanopy} />
              <View style={styles.treeTrunk} />
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* Main White Content Sheet with Sweeping Rounded Top */}
      <View style={styles.sheetContainer}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Action Grid: 8 Circular Icons in 4-column x 2-row */}
          <View style={styles.actionGrid}>
            {actionItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.actionItem}
                activeOpacity={0.7}
                onPress={item.onPress}
              >
                <View style={[styles.actionIconCircle, { backgroundColor: item.bgColor }]}>
                  <Ionicons name={item.icon as any} size={25} color={item.color} />
                </View>
                <Text style={styles.actionLabel} numberOfLines={2}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Faded Row & See More Dropdown Pill */}
          <View style={styles.seeMoreContainer}>
            {/* 4 Faded icons behind See More */}
            {!seeMoreOpen && (
              <View style={styles.fadedRow}>
                <View style={styles.fadedItem}>
                  <View style={[styles.fadedIconCircle, { backgroundColor: '#E0F2F1' }]}>
                    <Ionicons name="airplane-outline" size={22} color="#00897B" />
                  </View>
                </View>
                <View style={styles.fadedItem}>
                  <View style={[styles.fadedIconCircle, { backgroundColor: '#EDE7F6' }]}>
                    <Ionicons name="card-outline" size={22} color="#5E35B1" />
                  </View>
                </View>
                <View style={styles.fadedItem}>
                  <View style={[styles.fadedIconCircle, { backgroundColor: '#FFF3E0' }]}>
                    <Ionicons name="pie-chart-outline" size={22} color="#F57C00" />
                  </View>
                </View>
                <View style={styles.fadedItem}>
                  <View style={[styles.fadedIconCircle, { backgroundColor: '#FCE4EC' }]}>
                    <Ionicons name="time-outline" size={22} color="#D81B60" />
                  </View>
                </View>
              </View>
            )}

            {seeMoreOpen && (
              <View style={styles.expandedActionGrid}>
                {extraActionItems.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.actionItem}
                    activeOpacity={0.7}
                    onPress={item.onPress}
                  >
                    <View style={[styles.actionIconCircle, { backgroundColor: item.bgColor }]}>
                      <Ionicons name={item.icon as any} size={25} color={item.color} />
                    </View>
                    <Text style={styles.actionLabel}>{item.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Centered Floating See More Button */}
            <TouchableOpacity
              style={styles.seeMorePill}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityState={{ expanded: seeMoreOpen }}
              onPress={() => setSeeMoreOpen(!seeMoreOpen)}
            >
              <Text style={styles.seeMoreText}>{seeMoreOpen ? 'See Less' : 'See More'}</Text>
              <Ionicons
                name={seeMoreOpen ? 'chevron-up' : 'chevron-down'}
                size={14}
                color="#6B7280"
                style={{ marginLeft: 4 }}
              />
            </TouchableOpacity>
          </View>

          {/* Promotional / Send Abroad Banner matching Screenshot */}
          <ScrollView
            ref={promoCarouselRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            style={styles.promoCarousel}
            onLayout={(event) => setPromoWidth(event.nativeEvent.layout.width)}
            scrollEventThrottle={16}
            onScroll={(event) => {
              const nextIndex = Math.max(
                0,
                Math.min(
                  promoItems.length - 1,
                  Math.round(event.nativeEvent.contentOffset.x / slideWidth),
                ),
              );
              setActivePromo((current) => (current === nextIndex ? current : nextIndex));
            }}
          >
            {promoItems.map((promo) => (
              <View key={promo.id} style={{ width: slideWidth }}>
                <TouchableOpacity
                  style={[styles.promoBanner, { backgroundColor: promo.backgroundColor }]}
                  activeOpacity={0.85}
                  onPress={promo.onPress}
                >
                  <View style={styles.promoLeft}>
                    <Text style={styles.promoTitle}>{promo.title}</Text>
                    <Text style={styles.promoSubtitle}>{promo.subtitle}</Text>
                    <View style={styles.promoLinkRow}>
                      <Text style={styles.promoLink}>{promo.link}</Text>
                      <Ionicons name="arrow-forward" size={13} color={promo.iconColor} />
                    </View>
                  </View>

                  <View style={[styles.promoIllustrationCircle, { backgroundColor: promo.circleColor }]}>
                    <Ionicons name={promo.icon} size={42} color={promo.iconColor} />
                  </View>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>

          {/* Banner Dot Indicator: Pink pill + 2 gray dots */}
          <View style={styles.bannerDots}>
            {promoItems.map((promo, index) => (
              <TouchableOpacity
                key={promo.id}
                accessibilityRole="button"
                accessibilityLabel={`Show promotion ${index + 1}`}
                style={index === activePromo ? styles.bannerPillActive : styles.bannerDot}
                onPress={() => {
                  setActivePromo(index);
                  promoCarouselRef.current?.scrollTo({ x: index * slideWidth, animated: true });
                }}
              />
            ))}
          </View>

          {/* Quick features section */}
          <View style={styles.quickFeaturesSection}>
            <Text style={styles.quickFeaturesTitle}>Quick features</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.quickFeaturesRow}
            >
              <TouchableOpacity
                style={styles.quickFeatureChip}
                onPress={() => router.push('/send/amount')}
              >
                <Ionicons name="phone-portrait-outline" size={17} color="#00897B" />
                <Text style={styles.quickFeatureText}>Noor Mo...</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickFeatureChip}
                onPress={() => router.push('/send/pick')}
              >
                <Ionicons name="bag-handle-outline" size={17} color="#FB8C00" />
                <Text style={styles.quickFeatureText}>Bluebird...</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickFeatureChip}
                onPress={() => router.push('/kyc')}
              >
                <Ionicons name="shield-checkmark-outline" size={17} color={Colors.primary} />
                <Text style={styles.quickFeatureText}>KYC Verify</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerLandscape: {
    paddingBottom: 28,
    position: 'relative',
    overflow: 'hidden',
  },
  safeArea: {
    paddingHorizontal: 16,
    paddingTop: 6,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 20,
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
  balancePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  balanceIconCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  balanceCoinSymbol: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
  },
  balancePillText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  topRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  brandIconWrapper: {
    position: 'relative',
    marginLeft: 8,
  },
  brandBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  brandBadgeText: {
    color: '#111111',
    fontSize: 20,
    fontWeight: '900',
  },
  notificationBubble: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#111111',
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBubbleText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  landscapeCanvas: {
    height: 60,
    marginTop: 6,
    position: 'relative',
    overflow: 'hidden',
  },
  sunCircle: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    top: -20,
    left: '46%',
  },
  cloud1: {
    position: 'absolute',
    width: 44,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    top: 4,
    right: 50,
  },
  hillBack: {
    position: 'absolute',
    bottom: -15,
    left: -40,
    width: 320,
    height: 65,
    borderRadius: 35,
    backgroundColor: '#B71553',
  },
  hillFront: {
    position: 'absolute',
    bottom: -22,
    right: -30,
    width: 340,
    height: 75,
    borderRadius: 40,
    backgroundColor: '#9A0E44',
  },
  houseLeft: {
    position: 'absolute',
    bottom: 8,
    left: 45,
    zIndex: 5,
  },
  houseRoof: {
    width: 34,
    height: 12,
    backgroundColor: '#830837',
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
  },
  houseBody: {
    width: 30,
    height: 18,
    backgroundColor: '#D81B60',
    marginLeft: 2,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 3,
  },
  houseWindow: {
    width: 6,
    height: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 1,
  },
  houseDoor: {
    width: 5,
    height: 8,
    backgroundColor: '#FFFFFF',
    alignSelf: 'flex-end',
    borderTopLeftRadius: 1,
    borderTopRightRadius: 1,
  },
  houseRight: {
    position: 'absolute',
    bottom: 12,
    right: 55,
    zIndex: 5,
  },
  houseRoofRight: {
    width: 28,
    height: 10,
    backgroundColor: '#7A0532',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  houseBodyRight: {
    width: 24,
    height: 16,
    backgroundColor: '#D81B60',
    marginLeft: 2,
    paddingTop: 2,
    alignItems: 'center',
  },
  treeRight: {
    position: 'absolute',
    bottom: 12,
    right: 32,
    alignItems: 'center',
    zIndex: 5,
  },
  treeCanopy: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#5C0526',
  },
  treeTrunk: {
    width: 4,
    height: 8,
    backgroundColor: '#400319',
  },
  sheetContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -22,
    paddingTop: 16,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 28,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingTop: 6,
  },
  actionItem: {
    width: '25%',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 2,
  },
  actionIconCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  actionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
    lineHeight: 14,
  },
  seeMoreContainer: {
    position: 'relative',
    marginVertical: 10,
    minHeight: 64,
    justifyContent: 'center',
  },
  expandedActionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  promoCarousel: {
    width: '100%',
  },
  fadedRow: {
    flexDirection: 'row',
    opacity: 0.25,
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
  },
  fadedItem: {
    width: '25%',
    alignItems: 'center',
  },
  fadedIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  seeMorePill: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#ECEEF2',
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    zIndex: 10,
  },
  seeMoreText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4B5563',
  },
  promoBanner: {
    backgroundColor: '#E3F5F2',
    borderRadius: 22,
    paddingVertical: 16,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  promoLeft: {
    flex: 1,
    paddingRight: 12,
  },
  promoTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#004D40',
    lineHeight: 18,
    marginBottom: 4,
  },
  promoSubtitle: {
    fontSize: 11,
    color: '#00796B',
    marginBottom: 8,
  },
  promoLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  promoLink: {
    fontSize: 12,
    fontWeight: '700',
    color: '#004D40',
    marginRight: 4,
  },
  promoIllustrationCircle: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#C8ECE7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  bannerPillActive: {
    width: 18,
    height: 5,
    borderRadius: 3,
    backgroundColor: Colors.primary,
    marginHorizontal: 3,
  },
  bannerDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#D1D5DB',
    marginHorizontal: 3,
  },
  quickFeaturesSection: {
    marginTop: 4,
  },
  quickFeaturesTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111111',
    marginBottom: 12,
  },
  quickFeaturesRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quickFeatureChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#ECEEF2',
    marginRight: 10,
  },
  quickFeatureText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 8,
  },
});
