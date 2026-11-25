import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../src/theme/colors';

export default function KycScreen() {
  const router = useRouter();
  const [docType, setDocType] = useState<'passport' | 'id' | 'license'>('passport');
  const [isFrontUploaded, setIsFrontUploaded] = useState(true);
  const [isSelfieUploaded, setIsSelfieUploaded] = useState(true);

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#111111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>KYC Verification</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Verification Status Banner */}
        <View style={styles.statusBanner}>
          <View style={styles.badgeCircle}>
            <Ionicons name="checkmark-circle" size={24} color="#10B981" />
          </View>
          <View style={styles.statusTextContainer}>
            <Text style={styles.statusTitle}>Level 2 KYC Verified</Text>
            <Text style={styles.statusSub}>
              Your account has full access with unlocked $50,000 monthly limits.
            </Text>
          </View>
        </View>

        {/* Document Type Selector */}
        <Text style={styles.sectionTitle}>Document Type</Text>
        <View style={styles.docTypeRow}>
          {[
            { id: 'passport', label: 'Passport', icon: 'book-outline' },
            { id: 'id', label: 'National ID', icon: 'card-outline' },
            { id: 'license', label: 'Driving License', icon: 'car-outline' },
          ].map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.docTypeCard, docType === item.id && styles.docTypeCardActive]}
              onPress={() => setDocType(item.id as any)}
            >
              <Ionicons
                name={item.icon as any}
                size={22}
                color={docType === item.id ? Colors.primary : '#6B7280'}
              />
              <Text
                style={[styles.docTypeLabel, docType === item.id && styles.docTypeLabelActive]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Document Upload Area */}
        <Text style={styles.sectionTitle}>Identity Documents</Text>
        <View style={styles.uploadCard}>
          <View style={styles.uploadCardLeft}>
            <View style={styles.uploadIconCircle}>
              <Ionicons name="document-text-outline" size={22} color={Colors.primary} />
            </View>
            <View>
              <Text style={styles.uploadTitle}>Photo of Passport Page</Text>
              <Text style={styles.uploadStatus}>
                {isFrontUploaded ? 'Verified · passport_front.jpg' : 'Tap to upload or photograph'}
              </Text>
            </View>
          </View>
          <Ionicons
            name={isFrontUploaded ? 'checkmark-circle' : 'cloud-upload-outline'}
            size={22}
            color={isFrontUploaded ? '#10B981' : Colors.primary}
          />
        </View>

        {/* 3D Selfie Check */}
        <View style={styles.uploadCard}>
          <View style={styles.uploadCardLeft}>
            <View style={styles.uploadIconCircle}>
              <Ionicons name="camera-outline" size={22} color={Colors.primary} />
            </View>
            <View>
              <Text style={styles.uploadTitle}>3D Face Match & Liveness</Text>
              <Text style={styles.uploadStatus}>
                {isSelfieUploaded ? 'Biometrics matched (100% confidence)' : 'Tap to start selfie scan'}
              </Text>
            </View>
          </View>
          <Ionicons
            name={isSelfieUploaded ? 'checkmark-circle' : 'scan-outline'}
            size={22}
            color={isSelfieUploaded ? '#10B981' : Colors.primary}
          />
        </View>

        {/* Tier Limits Table */}
        <Text style={styles.sectionTitle}>Unlocked Benefits</Text>
        <View style={styles.limitsCard}>
          <View style={styles.limitRow}>
            <Text style={styles.limitLabel}>Daily Send Limit</Text>
            <Text style={styles.limitVal}>$10,000 USD</Text>
          </View>
          <View style={styles.limitDivider} />
          <View style={styles.limitRow}>
            <Text style={styles.limitLabel}>Monthly Send Limit</Text>
            <Text style={styles.limitVal}>$50,000 USD</Text>
          </View>
          <View style={styles.limitDivider} />
          <View style={styles.limitRow}>
            <Text style={styles.limitLabel}>Multi-Currency Wallets</Text>
            <Text style={styles.limitVal}>13 Active Currencies</Text>
          </View>
        </View>
      </ScrollView>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111111',
  },
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderRadius: 20,
    padding: 16,
    marginVertical: 14,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  badgeCircle: {
    marginRight: 12,
  },
  statusTextContainer: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#065F46',
    marginBottom: 2,
  },
  statusSub: {
    fontSize: 12,
    color: '#047857',
    lineHeight: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 16,
    marginBottom: 10,
  },
  docTypeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  docTypeCard: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  docTypeCardActive: {
    borderColor: Colors.primary,
    backgroundColor: '#FCE7EB',
  },
  docTypeLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
    marginTop: 6,
  },
  docTypeLabelActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  uploadCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  uploadCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  uploadIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FCE7EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  uploadTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 2,
  },
  uploadStatus: {
    fontSize: 12,
    color: '#6B7280',
  },
  limitsCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ECEEF2',
  },
  limitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  limitLabel: {
    fontSize: 13,
    color: '#6B7280',
  },
  limitVal: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111111',
  },
  limitDivider: {
    height: 1,
    backgroundColor: '#ECEEF2',
  },
});
