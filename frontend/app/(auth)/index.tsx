import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/theme/colors';

const SLIDES = [
  {
    id: 'currency',
    icon: 'globe-outline' as const,
    title: 'One wallet, every\ncurrency',
    subtitle: 'Hold, exchange and spend in 13 currencies at the real rate.',
  },
  {
    id: 'instant',
    icon: 'flash-outline' as const,
    title: 'Send money\nin seconds',
    subtitle: 'Transfer funds locally or abroad with low, transparent fees.',
  },
  {
    id: 'secure',
    icon: 'shield-checkmark-outline' as const,
    title: 'Bank-grade\nsecurity',
    subtitle: 'Protected with PIN, biometrics, and real-time fraud monitoring.',
  },
];

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [activeSlide, setActiveSlide] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  return (
    <View style={styles.root}>
      {/* Top Full-Bleed Pink Gradient Section */}
      <LinearGradient
        colors={['#E91E63', '#D81B60', '#C2185B']}
        style={[styles.heroGradient, { paddingTop: insets.top }]}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 1 }}
      >
        {/* Subtle decorative arc */}
        <View style={styles.bgGlow} />

        {/* Header Row: Payora Logo + English Pill */}
        <View style={styles.header}>
          <View style={styles.brandRow}>
            <View style={styles.logoBox}>
              <Image
                source={require('../../assets/payora.png')}
                style={styles.logoImg}
              />
            </View>
            <Text style={styles.brandTitle}>Payora</Text>
          </View>

          <TouchableOpacity style={styles.langPill} activeOpacity={0.75}>
            <Text style={styles.langText}>English</Text>
          </TouchableOpacity>
        </View>

        {/* Swipeable Hero Content */}
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          scrollEventThrottle={16}
          style={styles.slidesScroll}
          contentContainerStyle={styles.slidesContent}
          onScroll={(e) => {
            const idx = Math.max(
              0,
              Math.min(
                SLIDES.length - 1,
                Math.round(e.nativeEvent.contentOffset.x / Math.max(width, 1)),
              ),
            );
            setActiveSlide((cur) => (cur === idx ? cur : idx));
          }}
        >
          {SLIDES.map((slide) => (
            <View key={slide.id} style={[styles.slide, { width }]}>
              <View style={styles.haloCircle}>
                <View style={styles.innerCircle}>
                  <Ionicons name={slide.icon} size={42} color="#111111" />
                </View>
              </View>

              <Text style={styles.heroTitle}>{slide.title}</Text>
              <Text style={styles.heroSubtitle}>{slide.subtitle}</Text>
            </View>
          ))}
        </ScrollView>

        {/* Pagination Dots */}
        <View style={styles.dotsRow}>
          {SLIDES.map((s, idx) => (
            <TouchableOpacity
              key={s.id}
              onPress={() => {
                setActiveSlide(idx);
                scrollRef.current?.scrollTo({ x: idx * width, animated: true });
              }}
              style={[styles.dot, idx === activeSlide && styles.dotActive]}
            />
          ))}
        </View>
      </LinearGradient>

      {/* Bottom White Sheet */}
      <View style={[styles.bottomSheet, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <TouchableOpacity
          style={styles.loginButton}
          activeOpacity={0.85}
          onPress={() => router.push('/(auth)/phone')}
        >
          <Text style={styles.loginButtonText}>Log In</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.createAccountButton}
          activeOpacity={0.85}
          onPress={() => router.push('/(auth)/phone')}
        >
          <Text style={styles.createAccountText}>Create an account</Text>
        </TouchableOpacity>

        <Text style={styles.legalNotice}>
          By continuing you agree to our{' '}
          <Text style={styles.legalLink}>Terms</Text> and{' '}
          <Text style={styles.legalLink}>Privacy Policy</Text>
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  heroGradient: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
    paddingBottom: 38,
  },
  bgGlow: {
    position: 'absolute',
    bottom: -120,
    left: -60,
    right: -60,
    height: 220,
    borderRadius: 200,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    zIndex: 10,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    overflow: 'hidden',
  },
  logoImg: {
    width: 34,
    height: 34,
    borderRadius: 10,
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  langPill: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.55)',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  langText: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  slidesScroll: {
    flex: 1,
  },
  slidesContent: {
    alignItems: 'center',
  },
  slide: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  haloCircle: {
    width: 118,
    height: 118,
    borderRadius: 59,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 28,
  },
  innerCircle: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 33,
    marginBottom: 12,
  },
  heroSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 21,
    paddingHorizontal: 10,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    marginHorizontal: 3,
  },
  dotActive: {
    width: 20,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  bottomSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -22,
    paddingHorizontal: 22,
    paddingTop: 24,
  },
  loginButton: {
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  createAccountButton: {
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#F3C1D3',
    marginBottom: 18,
  },
  createAccountText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '700',
  },
  legalNotice: {
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'center',
  },
  legalLink: {
    color: Colors.primary,
    textDecorationLine: 'underline',
  },
});
