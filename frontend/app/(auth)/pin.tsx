import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/theme/colors';

export default function PinScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const phone = (params.phone as string) || '+1 415 555 0134';
  const [pin, setPin] = useState('');

  const handlePinChange = (value: string) => {
    const nextPin = value.replace(/\D/g, '').slice(0, 5);
    setPin(nextPin);
    if (nextPin.length === 5) {
      setTimeout(() => {
        router.push({
          pathname: '/(auth)/biometrics',
          params: { pin: nextPin, phone },
        });
      }, 200);
    }
  };

  const handleNext = () => {
    if (pin.length === 5) {
      router.push({
        pathname: '/(auth)/biometrics',
        params: { pin, phone },
      });
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

        <Text style={styles.stepIndicator}>Step 4 of 4</Text>

        <Image source={require("../../assets/payora.png")} style={{ width: 28, height: 28, borderRadius: 8 }} />
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        <Text style={styles.title}>Create your Payora PIN</Text>
        <Text style={styles.subtitle}>
          5 digits. You'll use it to log in and approve payments.
        </Text>

        {/* 5 Dots PIN Indicator */}
        <View style={styles.dotsContainer}>
          {[0, 1, 2, 3, 4].map((idx) => {
            const isFilled = pin.length > idx;
            return (
              <View
                key={idx}
                style={[styles.pinDot, isFilled && styles.pinDotFilled]}
              />
            );
          })}
          <TextInput
            style={styles.pinInputOverlay}
            value={pin}
            onChangeText={handlePinChange}
            keyboardType="number-pad"
            maxLength={5}
            secureTextEntry
            autoFocus
            returnKeyType="done"
            accessibilityLabel="Create your five-digit PIN"
          />
        </View>

        {/* Security Guidance Bullet Points */}
        <View style={styles.guidanceBox}>
          <View style={styles.guidanceItem}>
            <Ionicons name="alert-circle-outline" size={18} color="#6B7280" />
            <Text style={styles.guidanceText}>
              Avoid 12345, 11111 or your birth year
            </Text>
          </View>

          <View style={styles.guidanceItem}>
            <Ionicons name="shield-checkmark-outline" size={18} color="#6B7280" />
            <Text style={styles.guidanceText}>
              Payora will never ask for your PIN by call or SMS
            </Text>
          </View>
        </View>
      </View>

      {/* Bottom Button Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[
            styles.nextButton,
            pin.length === 5 ? styles.nextButtonActive : styles.nextButtonDisabled,
          ]}
          onPress={handleNext}
          disabled={pin.length < 5}
          activeOpacity={0.85}
        >
          <Text style={styles.nextButtonText}>Next</Text>
          <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
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
  stepIndicator: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
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
    paddingHorizontal: 24,
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111111',
    marginTop: 8,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 44,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 44,
    position: 'relative',
  },
  pinInputOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.01,
  },
  pinDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    backgroundColor: 'transparent',
    marginHorizontal: 12,
  },
  pinDotFilled: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
    transform: [{ scale: 1.1 }],
  },
  guidanceBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  guidanceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
  },
  guidanceText: {
    fontSize: 13,
    color: '#4B5563',
    marginLeft: 10,
    flex: 1,
  },
  bottomBar: {
    paddingHorizontal: 24,
    paddingVertical: 8,
  },
  nextButton: {
    height: 52,
    borderRadius: 26,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButtonActive: {
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  nextButtonDisabled: {
    backgroundColor: '#E5E7EB',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginRight: 8,
  },
});
