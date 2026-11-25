import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView,
  Modal,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/theme/colors';
import { COUNTRIES, CountryOption } from '../../src/constants/countries';

export default function AboutYourselfScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const phone = (params.phone as string) || '+1 415 555 0134';
  const initialCountry =
    COUNTRIES.find((c) => c.code === (params.countryCode as string)) || COUNTRIES[0];

  const [firstName, setFirstName] = useState('Noor');
  const [lastName, setLastName] = useState('Mohammad');
  const [dob, setDob] = useState('14/03/1994');
  const [address, setAddress] = useState('221 Market Street');
  const [city, setCity] = useState('San Francisco');
  const [postalCode, setPostalCode] = useState('94105');
  const [country, setCountry] = useState<CountryOption>(initialCountry);
  const [countryModalVisible, setCountryModalVisible] = useState(false);

  const [agreedTerms, setAgreedTerms] = useState(false);
  const [marketingOptIn, setMarketingOptIn] = useState(false);

  const canContinue =
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    dob.trim().length >= 6 &&
    address.trim().length > 0 &&
    city.trim().length > 0 &&
    postalCode.trim().length > 0 &&
    agreedTerms;

  const handleContinue = () => {
    if (!canContinue) return;
    router.push({
      pathname: '/(auth)/pin',
      params: {
        phone,
        fullName: `${firstName.trim()} ${lastName.trim()}`,
        countryCode: country.code,
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header with Step 3 of 4 Progress */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color="#111111" />
        </TouchableOpacity>

        <View style={styles.stepWrap}>
          <Text style={styles.stepIndicator}>Step 3 of 4</Text>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: '75%' }]} />
          </View>
        </View>

        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Tell us about yourself</Text>
        <Text style={styles.subtitle}>
          Use your legal name as it appears on your ID. Regulators in {country.name} require us to
          verify who you are.
        </Text>

        {/* First name & Last name */}
        <View style={styles.twoCol}>
          <View style={[styles.fieldBox, { flex: 1, marginRight: 10 }]}>
            <Text style={styles.fieldLabel}>First name</Text>
            <TextInput
              style={styles.fieldInput}
              value={firstName}
              onChangeText={setFirstName}
              placeholder="First name"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={[styles.fieldBox, { flex: 1 }]}>
            <Text style={styles.fieldLabel}>Last name</Text>
            <TextInput
              style={styles.fieldInput}
              value={lastName}
              onChangeText={setLastName}
              placeholder="Last name"
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>

        {/* Date of birth */}
        <View style={styles.fieldBox}>
          <Text style={styles.fieldLabel}>Date of birth</Text>
          <TextInput
            style={styles.fieldInput}
            value={dob}
            onChangeText={setDob}
            placeholder="DD/MM/YYYY"
            placeholderTextColor="#9CA3AF"
            keyboardType="numbers-and-punctuation"
          />
        </View>

        {/* Home address */}
        <View style={styles.fieldBox}>
          <Text style={styles.fieldLabel}>Home address</Text>
          <TextInput
            style={styles.fieldInput}
            value={address}
            onChangeText={setAddress}
            placeholder="Street address"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* City & Postal code */}
        <View style={styles.twoCol}>
          <View style={[styles.fieldBox, { flex: 1.2, marginRight: 10 }]}>
            <Text style={styles.fieldLabel}>City</Text>
            <TextInput
              style={styles.fieldInput}
              value={city}
              onChangeText={setCity}
              placeholder="City"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={[styles.fieldBox, { flex: 0.8 }]}>
            <Text style={styles.fieldLabel}>Postal code</Text>
            <TextInput
              style={styles.fieldInput}
              value={postalCode}
              onChangeText={setPostalCode}
              placeholder="Postal code"
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>

        {/* Country of residence */}
        <View style={styles.countryCard}>
          <View style={styles.countryBadge}>
            <Text style={styles.countryBadgeText}>{country.code}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.countryHint}>Country of residence</Text>
            <Text style={styles.countryValue}>{country.name}</Text>
          </View>
          <TouchableOpacity onPress={() => setCountryModalVisible(true)}>
            <Text style={styles.changeLink}>Change</Text>
          </TouchableOpacity>
        </View>

        {/* Checkboxes */}
        <TouchableOpacity
          style={styles.checkRow}
          activeOpacity={0.8}
          onPress={() => setAgreedTerms(!agreedTerms)}
        >
          <View style={[styles.checkbox, agreedTerms && styles.checkboxChecked]}>
            {agreedTerms && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
          </View>
          <Text style={styles.checkText}>
            I agree to the <Text style={styles.pinkLink}>Terms of Use</Text> and{' '}
            <Text style={styles.pinkLink}>Privacy Policy</Text>, and confirm I'm 18 or older.
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.checkRow}
          activeOpacity={0.8}
          onPress={() => setMarketingOptIn(!marketingOptIn)}
        >
          <View style={[styles.checkbox, marketingOptIn && styles.checkboxChecked]}>
            {marketingOptIn && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
          </View>
          <Text style={styles.checkText}>
            Email me product news and offers. Optional, unsubscribe any time.
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Bottom Continue Bar */}
      <TouchableOpacity
        style={[
          styles.continueBar,
          canContinue ? styles.continueBarActive : styles.continueBarDisabled,
        ]}
        activeOpacity={0.85}
        disabled={!canContinue}
        onPress={handleContinue}
      >
        <Text style={styles.continueText}>Continue</Text>
        <Ionicons name="arrow-forward" size={18} color={canContinue ? '#FFFFFF' : '#111111'} />
      </TouchableOpacity>

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
                      <Text
                        style={[
                          styles.codeBoxText,
                          selected && { color: '#FFFFFF' },
                        ]}
                      >
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 10,
  },
  backButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
  },
  stepWrap: {
    flex: 1,
    marginHorizontal: 8,
  },
  stepIndicator: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 6,
  },
  progressTrack: {
    height: 3,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111111',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 19,
    marginBottom: 20,
  },
  twoCol: {
    flexDirection: 'row',
  },
  fieldBox: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  fieldLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    marginBottom: 3,
  },
  fieldInput: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111111',
    padding: 0,
  },
  countryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: 2,
    marginBottom: 18,
  },
  countryBadge: {
    width: 28,
    height: 22,
    borderRadius: 5,
    backgroundColor: '#111111',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  countryBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  countryHint: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  countryValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111111',
  },
  changeLink: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    marginTop: 1,
  },
  checkboxChecked: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  checkText: {
    flex: 1,
    fontSize: 12,
    color: '#4B5563',
    lineHeight: 18,
  },
  pinkLink: {
    color: Colors.primary,
    textDecorationLine: 'underline',
    fontWeight: '600',
  },
  continueBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    height: 54,
  },
  continueBarActive: {
    backgroundColor: Colors.primary,
  },
  continueBarDisabled: {
    backgroundColor: '#9CA3AF',
  },
  continueText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  /* Modal */
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
