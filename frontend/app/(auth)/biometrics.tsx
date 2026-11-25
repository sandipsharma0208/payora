import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/context/AuthContext';
import { Colors } from '../../src/theme/colors';

export default function BiometricsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { enableBiometrics, loginWithPhone } = useAuth();
  const [loading, setLoading] = useState(false);

  const completeOnboarding = async (enableBio: boolean) => {
    setLoading(true);
    try {
      if (enableBio) {
        await enableBiometrics();
      }
      // Log in demo user into main tabs
      await loginWithPhone('+1 415 555 0134', (params.pin as string) || '12345');
      router.replace('/(tabs)');
    } catch (e) {
      console.warn('Biometric setup err:', e);
      router.replace('/(tabs)');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#111111" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Face ID</Text>

        <Image source={require("../../assets/payora.png")} style={{ width: 28, height: 28, borderRadius: 8 }} />
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Soft Circular Glow with Face ID Icon */}
        <View style={styles.iconContainerOuter}>
          <View style={styles.iconContainerMiddle}>
            <View style={styles.iconContainerInner}>
              <Ionicons name="scan-outline" size={54} color={Colors.primary} />
            </View>
          </View>
        </View>

        <Text style={styles.title}>Enable Face ID</Text>
        <Text style={styles.subtitle}>
          Log in and approve payments with a glance, instead of typing your PIN every time.
        </Text>

        {/* Privacy & Security Cards */}
        <View style={styles.cardsContainer}>
          <View style={styles.infoCard}>
            <View style={styles.iconCircle}>
              <Ionicons name="shield-checkmark" size={20} color={Colors.primary} />
            </View>
            <View style={styles.cardTextContainer}>
              <Text style={styles.cardTitle}>Your face data stays on your phone</Text>
              <Text style={styles.cardDesc}>
                Payora never stores or sees your Face ID data. Your phone handles your authentication securely.
              </Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <View style={styles.iconCircle}>
              <Ionicons name="person-circle-outline" size={20} color={Colors.primary} />
            </View>
            <View style={styles.cardTextContainer}>
              <Text style={styles.cardTitle}>Add only your own face</Text>
              <Text style={styles.cardDesc}>
                Anyone whose face is saved on this phone could log in, so don't add someone else's.
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.enableButton}
          activeOpacity={0.85}
          onPress={() => completeOnboarding(true)}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <View style={styles.buttonContent}>
              <Ionicons name="scan-outline" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.enableButtonText}>Enable Face ID</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.skipButton}
          activeOpacity={0.7}
          onPress={() => completeOnboarding(false)}
          disabled={loading}
        >
          <Text style={styles.skipButtonText}>Not now</Text>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111111',
  },
  logoBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#111111',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoBadgeText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 24,
    flex: 1,
    justifyContent: 'center',
  },
  iconContainerOuter: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#FDF2F4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 28,
  },
  iconContainerMiddle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#FCE7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainerInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111111',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  cardsContainer: {
    width: '100%',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FAFAFA',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FCE7EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardTextContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 17,
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  enableButton: {
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  enableButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  skipButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  skipButtonText: {
    color: '#6B7280',
    fontSize: 15,
    fontWeight: '600',
  },
});
