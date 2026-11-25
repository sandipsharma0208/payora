import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/theme/colors';

const { width } = Dimensions.get('window');

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <Image source={require("../../assets/payora.png")} style={{ width: 34, height: 34, borderRadius: 10, marginRight: 8 }} />
          <Text style={styles.brandTitle}>Payora</Text>
        </View>

        <TouchableOpacity style={styles.langPill} activeOpacity={0.7}>
          <Text style={styles.langText}>English</Text>
        </TouchableOpacity>
      </View>

      {/* Hero Card */}
      <View style={styles.heroCardContainer}>
        <LinearGradient
          colors={['#E91E63', '#D81B60', '#C2185B']}
          style={styles.heroCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Subtle background curved circles */}
          <View style={styles.bgCircle1} />
          <View style={styles.bgCircle2} />

          <View style={styles.illustrationCircle}>
            <Ionicons name="globe-outline" size={48} color="#E91E63" />
          </View>

          <Text style={styles.heroTitle}>One wallet, every currency</Text>
          <Text style={styles.heroSubtitle}>
            Hold, exchange and spend in 13 currencies at the real rate.
          </Text>

          {/* Dots Indicator */}
          <View style={styles.dotsRow}>
            <View style={[styles.dot, styles.dotActive]} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>
        </LinearGradient>
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.loginButton}
          activeOpacity={0.85}
          onPress={() => router.push('/(auth)/phone')}
        >
          <Text style={styles.loginButtonText}>Log in</Text>
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
          <Text style={styles.legalLink}>Privacy Policy</Text>.
        </Text>
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
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#111111',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  logoBadgeText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111111',
  },
  langPill: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  langText: {
    fontSize: 14,
    color: '#4B5563',
    fontWeight: '500',
  },
  heroCardContainer: {
    paddingHorizontal: 20,
    marginVertical: 16,
  },
  heroCard: {
    borderRadius: 36,
    paddingVertical: 44,
    paddingHorizontal: 24,
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#E91E63',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  bgCircle1: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    top: -60,
    right: -40,
  },
  bgCircle2: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    bottom: -40,
    left: -30,
  },
  illustrationCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 28,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  heroSubtitle: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 16,
    marginBottom: 28,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    marginHorizontal: 4,
  },
  dotActive: {
    width: 20,
    backgroundColor: '#FFFFFF',
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  loginButton: {
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  createAccountButton: {
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    marginBottom: 20,
  },
  createAccountText: {
    color: '#1F2937',
    fontSize: 17,
    fontWeight: '600',
  },
  legalNotice: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  legalLink: {
    color: '#4B5563',
    textDecorationLine: 'underline',
  },
});
