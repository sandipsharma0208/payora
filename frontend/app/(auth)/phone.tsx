import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  TextInput,
  Modal,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/theme/colors';
import { COUNTRIES, CountryOption } from '../../src/constants/countries';

export default function PhoneScreen() {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState('4155550134'); // Pre-filled default matching screenshot
  const [emailAddress, setEmailAddress] = useState('');
  const [authMode, setAuthMode] = useState<'mobile' | 'email'>('mobile');
  const [country, setCountry] = useState<CountryOption>(COUNTRIES[0]);
  const [countryModalVisible, setCountryModalVisible] = useState(false);

  const canContinue =
    authMode === 'mobile'
      ? phoneNumber.length >= 7
      : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailAddress.trim());

  const handleNext = () => {
    if (canContinue) {
      router.push({
        pathname: '/(auth)/verify',
        params: {
          phone: authMode === 'mobile' ? `${country.dial} ${phoneNumber}` : emailAddress.trim(),
          method: authMode,
          countryCode: country.code,
        },
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

        <Text style={styles.stepIndicator}>Step 1 of 4</Text>

        <Image source={require("../../assets/payora.png")} style={{ width: 28, height: 28, borderRadius: 8 }} />
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        <Text style={styles.title}>
          {authMode === 'mobile' ? 'Enter your mobile number' : 'Enter your email address'}
        </Text>
        <Text style={styles.subtitle}>
          {authMode === 'mobile'
            ? "We'll text you a code to confirm it's yours."
            : "We'll email you a code to confirm it's yours."}
        </Text>

        {/* Tab Toggle: Mobile / Email */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabButton, authMode === 'mobile' && styles.tabButtonActive]}
            onPress={() => setAuthMode('mobile')}
          >
            <Ionicons
              name="phone-portrait-outline"
              size={18}
              color={authMode === 'mobile' ? Colors.primary : '#6B7280'}
              style={{ marginRight: 6 }}
            />
            <Text
              style={[styles.tabText, authMode === 'mobile' && styles.tabTextActive]}
            >
              Mobile
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, authMode === 'email' && styles.tabButtonActive]}
            onPress={() => setAuthMode('email')}
          >
            <Ionicons
              name="mail-outline"
              size={18}
              color={authMode === 'email' ? Colors.primary : '#6B7280'}
              style={{ marginRight: 6 }}
            />
            <Text
              style={[styles.tabText, authMode === 'email' && styles.tabTextActive]}
            >
              Email
            </Text>
          </TouchableOpacity>
        </View>

        {/* Country Selector Box */}
        {authMode === 'mobile' && (
          <TouchableOpacity
            style={styles.countryBox}
            activeOpacity={0.8}
            onPress={() => setCountryModalVisible(true)}
          >
            <View style={styles.countryLeft}>
              <View style={styles.countryCodeSquare}>
                <Text style={styles.countryCodeSquareText}>{country.code}</Text>
              </View>
              <View>
                <Text style={styles.countryLabel}>Country of residence</Text>
                <Text style={styles.countryName}>{country.name}</Text>
              </View>
            </View>
            <View style={styles.countryRight}>
              <View style={styles.walletPill}>
                <Text style={styles.walletPillText}>{country.currency} wallet</Text>
              </View>
              <Ionicons name="chevron-down" size={18} color="#6B7280" />
            </View>
          </TouchableOpacity>
        )}

        <View style={styles.phoneInputBox}>
          {authMode === 'mobile' && (
            <>
              <TouchableOpacity
                style={styles.dialPicker}
                onPress={() => setCountryModalVisible(true)}
              >
                <Text style={styles.countryCode}>{country.dial}</Text>
                <Ionicons name="chevron-down" size={14} color="#6B7280" style={{ marginLeft: 3 }} />
              </TouchableOpacity>
              <View style={styles.inputDivider} />
            </>
          )}
          <TextInput
            style={[styles.phoneNumberText, authMode === 'email' && styles.emailInput]}
            value={authMode === 'mobile' ? phoneNumber : emailAddress}
            onChangeText={(value) => {
              if (authMode === 'mobile') {
                setPhoneNumber(value.replace(/\D/g, '').slice(0, 10));
              } else {
                setEmailAddress(value);
              }
            }}
            keyboardType={authMode === 'mobile' ? 'phone-pad' : 'email-address'}
            autoFocus
            autoCapitalize="none"
            autoComplete={authMode === 'mobile' ? 'tel' : 'email'}
            placeholder={authMode === 'mobile' ? '415 555 0134' : 'name@example.com'}
            placeholderTextColor="#D1D5DB"
            returnKeyType="next"
            onSubmitEditing={handleNext}
            accessibilityLabel={authMode === 'mobile' ? 'Mobile phone number' : 'Email address'}
          />
        </View>

        {authMode === 'mobile' && (
          <View style={styles.privacyRow}>
            <Ionicons name="lock-closed-outline" size={14} color="#9CA3AF" />
            <Text style={styles.privacyText}>
              We only use your number to secure your account
            </Text>
          </View>
        )}
      </View>

      {/* Bottom Button Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[
            styles.nextButton,
            canContinue ? styles.nextButtonActive : styles.nextButtonDisabled,
          ]}
          onPress={handleNext}
          disabled={!canContinue}
          activeOpacity={0.85}
        >
          <Text style={styles.nextButtonText}>Next</Text>
          <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Where do you live? Country Picker Modal */}
      <Modal visible={countryModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Where do you live?</Text>
              <TouchableOpacity onPress={() => setCountryModalVisible(false)}>
                <Text style={styles.modalDone}>Done</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSub}>
              Sets your dialing code and primary currency. You can still hold and spend in 13
              currencies.
            </Text>

            <FlatList
              data={COUNTRIES}
              keyExtractor={(item) => item.code}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => {
                const selected = item.code === country.code;
                return (
                  <TouchableOpacity
                    style={[styles.countryRow, selected && styles.countryRowSelected]}
                    onPress={() => {
                      setCountry(item);
                      setCountryModalVisible(false);
                    }}
                  >
                    <View
                      style={[
                        styles.codeBox,
                        selected ? styles.codeBoxSelected : styles.codeBoxIdle,
                      ]}
                    >
                      <Text style={[styles.codeBoxText, selected && { color: '#FFFFFF' }]}>
                        {item.code}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.countryRowName}>{item.name}</Text>
                      <Text style={styles.countryRowSub}>
                        {item.dial} · {item.currencyName}
                      </Text>
                    </View>
                    {selected ? (
                      <View style={styles.selectedPill}>
                        <Text style={styles.selectedPillText}>Selected</Text>
                      </View>
                    ) : (
                      <View style={styles.currencyPill}>
                        <Text style={styles.currencyPillText}>{item.currency}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </View>
      </Modal>
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
    marginBottom: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 14,
    padding: 4,
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 10,
  },
  tabButtonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  tabTextActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  countryBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
  },
  countryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flag: {
    fontSize: 26,
    marginRight: 12,
  },
  countryLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    textTransform: 'uppercase',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  countryName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  phoneInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.primary,
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    marginBottom: 12,
  },
  countryCode: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111111',
  },
  inputDivider: {
    width: 1.5,
    height: 24,
    backgroundColor: Colors.primary,
    marginHorizontal: 12,
  },
  phoneNumberText: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#111111',
    letterSpacing: 1.2,
  },
  emailInput: {
    letterSpacing: 0,
    fontSize: 16,
  },
  privacyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  privacyText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginLeft: 6,
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
  countryCodeSquare: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#FCE8F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  countryCodeSquareText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.primary,
  },
  countryRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  walletPill: {
    backgroundColor: '#E0F2F1',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  walletPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#00796B',
  },
  dialPicker: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 28,
    maxHeight: '80%',
  },
  modalHandle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E5E7EB',
    alignSelf: 'center',
    marginBottom: 14,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111111',
  },
  modalDone: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.primary,
  },
  modalSub: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 17,
    marginBottom: 14,
  },
  countryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginBottom: 4,
  },
  countryRowSelected: {
    backgroundColor: '#FDF2F6',
  },
  codeBox: {
    width: 34,
    height: 34,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  codeBoxSelected: {
    backgroundColor: Colors.primary,
  },
  codeBoxIdle: {
    backgroundColor: '#F3F4F6',
  },
  codeBoxText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#111111',
  },
  countryRowName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111111',
  },
  countryRowSub: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 1,
  },
  selectedPill: {
    backgroundColor: '#FCE8F0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  selectedPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  currencyPill: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  currencyPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4B5563',
  },
});
