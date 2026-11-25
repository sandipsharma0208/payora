import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/theme/colors';

export default function VerifyScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const displayPhone = (params.phone as string) || '+1 415 555 0134';

  const [code, setCode] = useState('');
  const [timer, setTimer] = useState(44);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleCodeChange = (value: string) => {
    const nextCode = value.replace(/\D/g, '').slice(0, 6);
    setCode(nextCode);
    if (nextCode.length === 6) {
      setTimeout(() => {
        router.push('/(auth)/pin');
      }, 200);
    }
  };

  const handleVerify = () => {
    if (code.length === 6) {
      router.push('/(auth)/pin');
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

        <Text style={styles.stepIndicator}>Step 2 of 4</Text>

        <Image source={require("../../assets/payora.png")} style={{ width: 28, height: 28, borderRadius: 8 }} />
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        <Text style={styles.title}>Enter verification code</Text>
        <View style={styles.subtitleRow}>
          <Text style={styles.subtitle}>
            We sent a 6-digit code to {displayPhone}{' '}
          </Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.editLink}>Edit</Text>
          </TouchableOpacity>
        </View>

        {/* 6 OTP Boxes */}
        <View style={styles.otpContainer}>
          {[0, 1, 2, 3, 4, 5].map((idx) => {
            const digit = code[idx] || '';
            const isCurrent = code.length === idx;
            return (
              <View
                key={idx}
                style={[
                  styles.otpBox,
                  isCurrent && styles.otpBoxCurrent,
                  Boolean(digit) && styles.otpBoxFilled,
                ]}
              >
                <Text style={styles.otpDigit}>{digit}</Text>
                {isCurrent && <View style={styles.cursor} />}
              </View>
            );
          })}
          <TextInput
            style={styles.otpInputOverlay}
            value={code}
            onChangeText={handleCodeChange}
            keyboardType="number-pad"
            maxLength={6}
            textContentType="oneTimeCode"
            autoComplete="one-time-code"
            autoFocus
            returnKeyType="done"
            accessibilityLabel="Six-digit verification code"
          />
        </View>

        {/* Resend Timer */}
        <View style={styles.resendRow}>
          <Ionicons name="time-outline" size={16} color="#6B7280" />
          <Text style={styles.resendText}>
            {timer > 0 ? `Resend code in 0:${timer < 10 ? '0' : ''}${timer}` : 'Resend code'}
          </Text>
        </View>

        {/* Info Callout Box */}
        <View style={styles.calloutBox}>
          <View style={styles.calloutLeft}>
            <Ionicons name="chatbubbles-outline" size={20} color="#4B5563" />
            <Text style={styles.calloutText}>
              No text yet? We can call you with the code.
            </Text>
          </View>
          <TouchableOpacity activeOpacity={0.7}>
            <Text style={styles.calloutAction}>Call me</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom Button Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[
            styles.verifyButton,
            code.length === 6 ? styles.verifyButtonActive : styles.verifyButtonDisabled,
          ]}
          onPress={handleVerify}
          disabled={code.length < 6}
          activeOpacity={0.85}
        >
          <Text style={styles.verifyButtonText}>Verify</Text>
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
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  editLink: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '700',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    position: 'relative',
  },
  otpInputOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.01,
  },
  otpBox: {
    width: 48,
    height: 56,
    borderRadius: 14,
    backgroundColor: '#F9FAFB',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  otpBoxCurrent: {
    borderColor: Colors.primary,
    backgroundColor: '#FFFFFF',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 2,
  },
  otpBoxFilled: {
    borderColor: '#111111',
    backgroundColor: '#FFFFFF',
  },
  otpDigit: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111111',
  },
  cursor: {
    position: 'absolute',
    bottom: 12,
    width: 14,
    height: 2,
    backgroundColor: Colors.primary,
  },
  resendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  resendText: {
    fontSize: 13,
    color: '#6B7280',
    marginLeft: 6,
    fontWeight: '500',
  },
  calloutBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    padding: 14,
  },
  calloutLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  calloutText: {
    fontSize: 13,
    color: '#4B5563',
    marginLeft: 10,
    flex: 1,
  },
  calloutAction: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  bottomBar: {
    paddingHorizontal: 24,
    paddingVertical: 8,
  },
  verifyButton: {
    height: 52,
    borderRadius: 26,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifyButtonActive: {
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  verifyButtonDisabled: {
    backgroundColor: '#E5E7EB',
  },
  verifyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginRight: 8,
  },
});
