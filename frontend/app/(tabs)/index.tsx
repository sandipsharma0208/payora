import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/theme/colors';
import { ApiService, WalletAccount } from '../../src/services/api';

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [balanceVisible, setBalanceVisible] = useState(false);
  const [accounts, setAccounts] = useState<WalletAccount[]>([]);
  const [seeMoreOpen, setSeeMoreOpen] = useState(false);
  const [activePromo, setActivePromo] = useState(0);
  const [promoWidth, setPromoWidth] = useState(0);
  const promoCarouselRef = useRef<ScrollView>(null);
  const { width: screenWidth } = useWindowDimensions();
  const slideWidth = promoWidth || Math.max(screenWidth - 32, 1);

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
      icon: 'arrow-redo-circle-outline' as const,
      color: '#E91E63',
      bgColor: '#FDE8EE',
      onPress: () => router.push('/send/pick'),
    },
    {
      id: 'send-abroad',
      label: 'Send Abroad',
      icon: 'globe-outline' as const,
      color: '#1E88E5',
      bgColor: '#E3F2FD',
      onPress: () => router.push('/send-abroad'),
    },
    {
      id: 'exchange',
      label: 'Exchange',
      icon: 'swap-horizontal' as const,
      color: '#00897B',
      bgColor: '#E0F2F1',
      onPress: () => router.push('/(tabs)/my-payora'),
    },
    {
      id: 'pay',
      label: 'Pay',
      icon: 'bag-handle-outline' as const,
      color: '#FB8C00',
      bgColor: '#FFF3E0',
      onPress: () => router.push('/(tabs)/scan-qr'),
    },
    {
      id: 'add-money',
      label: 'Add Money',
      icon: 'wallet-outline' as const,
      color: '#8E24AA',
      bgColor: '#F3E5F5',
      onPress: () => router.push('/(tabs)/my-payora'),
    },
    {
      id: 'withdraw',
      label: 'Withdraw',
      icon: 'cash-outline' as const,
      color: '#00838F',
      bgColor: '#E0F7FA',
      onPress: () => router.push('/(tabs)/my-payora'),
    },
    {
      id: 'mobile-topup',
      label: 'Mobile Top-up',
      icon: 'phone-portrait-outline' as const,
      color: '#2E7D32',
      bgColor: '#E8F5E9',
      onPress: () => router.push('/send/pick'),
    },
    {
      id: 'pay-bills',
      label: 'Pay Bills',
      icon: 'bulb-outline' as const,
      color: '#43A047',
      bgColor: '#E8F5E9',
      onPress: () => router.push('/(tabs)/my-payora'),
    },
  ];

  const extraActionItems = [
    {
      id: 'travel',
      label: 'Travel',
      icon: 'airplane-outline' as const,
      color: '#00897B',
      bgColor: '#E0F2F1',
      onPress: () => router.push('/send-abroad'),
    },
    {
      id: 'cards',
      label: 'Cards',
      icon: 'card-outline' as const,
      color: '#5E35B1',
      bgColor: '#EDE7F6',
      onPress: () => router.push('/(tabs)/my-payora'),
    },
    {
      id: 'savings',
      label: 'Savings',
      icon: 'pie-chart-outline' as const,
      color: '#F57C00',
      bgColor: '#FFF3E0',
      onPress: () => router.push('/(tabs)/my-payora'),
    },
    {
      id: 'activity',
      label: 'Activity',
      icon: 'time-outline' as const,
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
      icon: 'globe-outline' as const,
      backgroundColor: '#E3F5F2',
      circleColor: '#B2DFDB',
      iconColor: '#004D40',
      onPress: () => router.push('/send-abroad'),
    },
    {
      id: 'savings',
      title: 'Make your money work harder',
      subtitle: 'Explore Payora savings options',
      link: 'View savings',
      icon: 'leaf-outline' as const,
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
      icon: 'shield-checkmark-outline' as const,
      backgroundColor: '#EFF6FF',
      circleColor: '#DBEAFE',
      iconColor: '#2563EB',
      onPress: () => router.push('/kyc'),
    },
  ] as const;

  return (
    <View style={styles.root}>
      {/* Pink header that starts from very top (behind status bar) */}
      <LinearGradient
        colors={['#E91E63', '#D81B60', '#C2185B']}
        style={[styles.headerGradient, { paddingTop: insets.top }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Top bar: avatar, name, balance pill, search, logo */}
        <View style={styles.topBar}>
          <View style={styles.userSection}>
            <Image
              source={{
                uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
              }}
              style={styles.avatar}
            />
            <View style={styles.userInfo}>
              <Text style={styles.userName}>Noor Mohammad</Text>
              <TouchableOpacity
                style={styles.balancePill}
                activeOpacity={0.8}
                onPress={() => setBalanceVisible(!balanceVisible)}
              >
                <View style={styles.balanceIconCircle}>
                  <Text style={styles.balanceCoinSymbol}>$</Text>
                </View>
                <Text style={styles.balancePillText}>
                  {balanceVisible ? primaryBalance : 'Tap for Balance'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.topRightActions}>
            <TouchableOpacity
              style={styles.circleBtn}
              activeOpacity={0.8}
              onPress={() => router.push('/ai-support')}
            >
              <Ionicons name="search" size={18} color="#333333" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.brandBtnWrapper}
              activeOpacity={0.8}
              onPress={() => router.push('/(tabs)/inbox')}
            >
              <Image source={require('../../assets/payora.png')} style={styles.brandBadge} />
              <View style={styles.notifDot}>
                <Text style={styles.notifDotText}>5</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Landscape artwork: sun + cloud + rolling mountains + cottages + road + tree */}
        <View style={styles.landscape}>
          {/* Soft pink rising sun */}
          <View style={styles.sun} />

          {/* Fluffy cloud near search icon */}
          <View style={styles.cloudWrap}>
            <View style={[styles.cloudPuff, { width: 14, height: 14, left: 4, top: 3 }]} />
            <View style={[styles.cloudPuff, { width: 18, height: 18, left: 11, top: 0 }]} />
            <View style={[styles.cloudPuff, { width: 13, height: 13, left: 22, top: 4 }]} />
            <View style={styles.cloudBase} />
          </View>

          {/* Back rolling pink mountains */}
          <View style={styles.mountainBackLeft} />
          <View style={styles.mountainBackRight} />

          {/* Left dark-magenta foreground hill */}
          <View style={styles.hillLeft} />

          {/* Right medium-magenta foreground hill */}
          <View style={styles.hillRight} />

          {/* Light-pink curved path sweeping from right */}
          <View style={styles.roadCurve} />

          {/* Left cottage (pale pink wall + maroon pitched roof) */}
          <View style={styles.houseLeft}>
            <View style={styles.roofLeft}>
              <View style={styles.roofLeftTop} />
            </View>
            <View style={styles.bodyLeft}>
              <View style={styles.doorLeft} />
              <View style={styles.windowLeft} />
            </View>
          </View>

          {/* Right cottage (pale pink wall + maroon pitched roof) */}
          <View style={styles.houseRight}>
            <View style={styles.roofRight} />
            <View style={styles.bodyRight}>
              <View style={styles.doorRight} />
              <View style={styles.windowRight} />
            </View>
          </View>

          {/* Tree beside right cottage */}
          <View style={styles.tree}>
            <View style={styles.treeCanopyMain} />
            <View style={styles.treeCanopySide} />
            <View style={styles.treeTrunk} />
          </View>
        </View>
      </LinearGradient>

      {/* White content sheet with rounded top */}
      <View style={styles.sheet}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: 0 }]}
        >
          {/* 8 Action icons — 4 × 2 grid */}
          <View style={styles.actionGrid}>
            {actionItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.actionItem}
                activeOpacity={0.7}
                onPress={item.onPress}
              >
                <View style={[styles.actionCircle, { backgroundColor: item.bgColor }]}>
                  <Ionicons name={item.icon} size={24} color={item.color} />
                </View>
                <Text style={styles.actionLabel} numberOfLines={2}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* See More row */}
          <View style={styles.seeMoreArea}>
            {!seeMoreOpen && (
              <View style={styles.fadedRow}>
                {[
                  { icon: 'airplane-outline' as const, bg: '#E0F2F1', color: '#00897B' },
                  { icon: 'card-outline' as const, bg: '#EDE7F6', color: '#5E35B1' },
                  { icon: 'pie-chart-outline' as const, bg: '#FFF3E0', color: '#F57C00' },
                  { icon: 'time-outline' as const, bg: '#FCE4EC', color: '#D81B60' },
                ].map((f, i) => (
                  <View key={i} style={styles.fadedItem}>
                    <View style={[styles.fadedCircle, { backgroundColor: f.bg }]}>
                      <Ionicons name={f.icon} size={22} color={f.color} />
                    </View>
                  </View>
                ))}
              </View>
            )}

            {seeMoreOpen && (
              <View style={styles.actionGrid}>
                {extraActionItems.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.actionItem}
                    activeOpacity={0.7}
                    onPress={item.onPress}
                  >
                    <View style={[styles.actionCircle, { backgroundColor: item.bgColor }]}>
                      <Ionicons name={item.icon} size={24} color={item.color} />
                    </View>
                    <Text style={styles.actionLabel}>{item.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <TouchableOpacity
              style={styles.seeMorePill}
              activeOpacity={0.8}
              onPress={() => setSeeMoreOpen(!seeMoreOpen)}
            >
              <Text style={styles.seeMoreText}>{seeMoreOpen ? 'See Less' : 'See More'}</Text>
              <Ionicons
                name={seeMoreOpen ? 'chevron-up' : 'chevron-down'}
                size={13}
                color="#6B7280"
                style={{ marginLeft: 4 }}
              />
            </TouchableOpacity>
          </View>

          {/* Promo carousel */}
          <ScrollView
            ref={promoCarouselRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            style={styles.promoScroll}
            onLayout={(e) => setPromoWidth(e.nativeEvent.layout.width)}
            scrollEventThrottle={16}
            onScroll={(e) => {
              const idx = Math.max(
                0,
                Math.min(
                  promoItems.length - 1,
                  Math.round(e.nativeEvent.contentOffset.x / slideWidth),
                ),
              );
              setActivePromo((cur) => (cur === idx ? cur : idx));
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
                    <Text style={[styles.promoTitle, { color: promo.iconColor }]}>
                      {promo.title}
                    </Text>
                    <Text style={styles.promoSub}>{promo.subtitle}</Text>
                    <View style={styles.promoLinkRow}>
                      <Text style={[styles.promoLink, { color: promo.iconColor }]}>
                        {promo.link}
                      </Text>
                      <Ionicons name="arrow-forward" size={12} color={promo.iconColor} />
                    </View>
                  </View>
                  <View style={[styles.promoCircle, { backgroundColor: promo.circleColor }]}>
                    <Ionicons name={promo.icon} size={40} color={promo.iconColor} />
                  </View>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>

          {/* Dot indicator */}
          <View style={styles.dots}>
            {promoItems.map((p, i) => (
              <TouchableOpacity
                key={p.id}
                style={i === activePromo ? styles.dotActive : styles.dot}
                onPress={() => {
                  setActivePromo(i);
                  promoCarouselRef.current?.scrollTo({ x: i * slideWidth, animated: true });
                }}
              />
            ))}
          </View>

          {/* Quick features */}
          <View style={styles.quickSection}>
            <Text style={styles.quickTitle}>Quick features</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.quickRow}
            >
              <TouchableOpacity style={styles.chip} onPress={() => router.push('/send/amount')}>
                <Ionicons name="phone-portrait-outline" size={16} color="#00897B" />
                <Text style={styles.chipText}>Noor Mo...</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.chip} onPress={() => router.push('/send/pick')}>
                <Ionicons name="bag-handle-outline" size={16} color="#FB8C00" />
                <Text style={styles.chipText}>Bluebird...</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.chip} onPress={() => router.push('/kyc')}>
                <Ionicons name="shield-checkmark-outline" size={16} color={Colors.primary} />
                <Text style={styles.chipText}>KYC Verify</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#E91E63',
  },
  /* ── Header ── */
  headerGradient: {
    paddingBottom: 38,
    overflow: 'hidden',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    zIndex: 20,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    marginRight: 10,
  },
  userInfo: {
    justifyContent: 'center',
  },
  userName: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  balancePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 2,
  },
  balanceIconCircle: {
    width: 15,
    height: 15,
    borderRadius: 8,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 5,
  },
  balanceCoinSymbol: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
  },
  balancePillText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  topRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  circleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  brandBtnWrapper: {
    marginLeft: 8,
    position: 'relative',
  },
  brandBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  notifDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#111111',
    width: 15,
    height: 15,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notifDotText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '900',
  },
  /* ── Landscape artwork ── */
  landscape: {
    height: 100,
    marginTop: 4,
    position: 'relative',
    overflow: 'hidden',
  },
  sun: {
    position: 'absolute',
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: 'rgba(255, 190, 215, 0.36)',
    top: 4,
    left: '37%',
  },
  cloudWrap: {
    position: 'absolute',
    top: 2,
    right: 92,
    width: 40,
    height: 20,
  },
  cloudPuff: {
    position: 'absolute',
    borderRadius: 10,
    backgroundColor: 'rgba(255, 190, 215, 0.3)',
  },
  cloudBase: {
    position: 'absolute',
    bottom: 2,
    left: 2,
    right: 2,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 190, 215, 0.3)',
  },
  mountainBackLeft: {
    position: 'absolute',
    bottom: -240,
    left: -90,
    width: 340,
    height: 300,
    borderRadius: 170,
    backgroundColor: '#EF4782',
  },
  mountainBackRight: {
    position: 'absolute',
    bottom: -245,
    right: -70,
    width: 360,
    height: 310,
    borderRadius: 180,
    backgroundColor: '#EF4782',
  },
  hillLeft: {
    position: 'absolute',
    bottom: -270,
    left: -80,
    width: 350,
    height: 320,
    borderRadius: 175,
    backgroundColor: '#C40E52',
    zIndex: 2,
  },
  hillRight: {
    position: 'absolute',
    bottom: -280,
    right: -80,
    width: 360,
    height: 320,
    borderRadius: 180,
    backgroundColor: '#DB1961',
    zIndex: 1,
  },
  roadCurve: {
    position: 'absolute',
    bottom: -120,
    right: -50,
    width: 260,
    height: 148,
    borderRadius: 130,
    borderTopWidth: 10,
    borderColor: '#F9B2CB',
    backgroundColor: 'transparent',
    zIndex: 3,
  },
  houseLeft: {
    position: 'absolute',
    bottom: 14,
    left: 52,
    alignItems: 'center',
    zIndex: 5,
  },
  roofLeft: {
    width: 44,
    height: 13,
    backgroundColor: '#8B0736',
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    transform: [{ scaleX: 1.05 }],
  },
  roofLeftTop: {
    width: '100%',
    height: 2,
  },
  bodyLeft: {
    width: 36,
    height: 20,
    backgroundColor: '#FADCE6',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 6,
    paddingBottom: 2,
  },
  doorLeft: {
    width: 7,
    height: 11,
    backgroundColor: '#D81B60',
    borderTopLeftRadius: 1,
    borderTopRightRadius: 1,
  },
  windowLeft: {
    width: 7,
    height: 6,
    backgroundColor: '#D81B60',
    marginBottom: 4,
    borderRadius: 1,
  },
  houseRight: {
    position: 'absolute',
    bottom: 24,
    right: 48,
    alignItems: 'center',
    zIndex: 5,
  },
  roofRight: {
    width: 32,
    height: 10,
    backgroundColor: '#8B0736',
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
  },
  bodyRight: {
    width: 26,
    height: 15,
    backgroundColor: '#FADCE6',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 4,
    paddingBottom: 1,
  },
  doorRight: {
    width: 5,
    height: 8,
    backgroundColor: '#D81B60',
  },
  windowRight: {
    width: 5,
    height: 5,
    backgroundColor: '#D81B60',
    marginBottom: 3,
  },
  tree: {
    position: 'absolute',
    bottom: 24,
    right: 22,
    alignItems: 'center',
    zIndex: 6,
  },
  treeCanopyMain: {
    width: 19,
    height: 19,
    borderRadius: 10,
    backgroundColor: '#9E0B42',
  },
  treeCanopySide: {
    position: 'absolute',
    top: 4,
    left: -5,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#B5124F',
  },
  treeTrunk: {
    width: 3,
    height: 9,
    backgroundColor: '#7A0532',
    marginTop: -1,
  },
  /* ── White sheet ── */
  sheet: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -24,
    overflow: 'hidden',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  /* ── Action grid ── */
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  actionItem: {
    width: '25%',
    alignItems: 'center',
    marginBottom: 14,
    paddingHorizontal: 2,
  },
  actionCircle: {
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
  /* ── See More ── */
  seeMoreArea: {
    position: 'relative',
    minHeight: 60,
    justifyContent: 'center',
    marginBottom: 14,
  },
  fadedRow: {
    flexDirection: 'row',
    opacity: 0.22,
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
  },
  fadedItem: {
    width: '25%',
    alignItems: 'center',
  },
  fadedCircle: {
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
    borderColor: '#E5E7EB',
    paddingHorizontal: 18,
    paddingVertical: 7,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 5,
    elevation: 3,
    zIndex: 10,
  },
  seeMoreText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
  },
  /* ── Promo banner ── */
  promoScroll: {
    marginBottom: 10,
  },
  promoBanner: {
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  promoLeft: {
    flex: 1,
    paddingRight: 10,
  },
  promoTitle: {
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 18,
    marginBottom: 3,
  },
  promoSub: {
    fontSize: 11,
    color: '#00796B',
    marginBottom: 8,
  },
  promoLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  promoLink: {
    fontSize: 12,
    fontWeight: '700',
  },
  promoCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  /* ── Dots ── */
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },
  dotActive: {
    width: 18,
    height: 5,
    borderRadius: 3,
    backgroundColor: Colors.primary,
    marginHorizontal: 3,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#D1D5DB',
    marginHorizontal: 3,
  },
  /* ── Quick features ── */
  quickSection: {
    marginTop: 2,
    marginBottom: 8,
  },
  quickTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111111',
    marginBottom: 10,
  },
  quickRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 4,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginRight: 10,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 7,
  },
});
