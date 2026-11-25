import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  FlatList,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { CameraView, Camera } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { Colors } from '../src/theme/colors';
import { COUNTRIES, CountryOption } from '../src/constants/countries';

type KycStage = 'intro' | 'id_capture' | 'selfie' | 'verified';
type DocType = 'passport' | 'national_id' | 'drivers_license';

export default function KycScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const cameraRef = useRef<CameraView>(null);

  const [stage, setStage] = useState<KycStage>('intro');
  const [country, setCountry] = useState<CountryOption>(COUNTRIES[0]);
  const [countryModalVisible, setCountryModalVisible] = useState(false);

  const [docType, setDocType] = useState<DocType>('passport');
  const [hasCameraPerm, setHasCameraPerm] = useState<boolean | null>(null);
  const [idCaptured, setIdCaptured] = useState(false);
  const [selfieCaptured, setSelfieCaptured] = useState(false);
  const [processing, setProcessing] = useState(false);

  const handleBack = () => {
    if (stage === 'id_capture') setStage('intro');
    else if (stage === 'selfie') setStage('id_capture');
    else router.back();
  };

  const startVerification = async () => {
    if (Platform.OS === 'web') {
      setHasCameraPerm(false);
      setStage('id_capture');
      return;
    }
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasCameraPerm(status === 'granted');
    setStage('id_capture');
  };

  const handleCaptureId = async () => {
    setProcessing(true);
    try {
      if (hasCameraPerm && cameraRef.current) {
        await cameraRef.current.takePictureAsync({ quality: 0.5 }).catch(() => {});
      }
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      setIdCaptured(true);
      setTimeout(() => {
        setProcessing(false);
        setStage('selfie');
      }, 600);
    } catch {
      setIdCaptured(true);
      setProcessing(false);
      setStage('selfie');
    }
  };

  const handleCaptureSelfie = async () => {
    setProcessing(true);
    try {
      if (hasCameraPerm && cameraRef.current) {
        await cameraRef.current.takePictureAsync({ quality: 0.5 }).catch(() => {});
      }
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      setSelfieCaptured(true);
      setTimeout(() => {
        setProcessing(false);
        setStage('verified');
      }, 1200);
    } catch {
      setSelfieCaptured(true);
      setProcessing(false);
      setStage('verified');
    }
  };

  return (
    <View style={styles.root}>
      {/* Pink Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          onPress={handleBack}
          style={styles.backBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={22} color="#111111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {stage === 'id_capture'
            ? 'Scan Photo ID'
            : stage === 'selfie'
              ? 'Take a Selfie'
              : 'Verify your identity'}
        </Text>
        <View style={{ width: 32 }} />
      </View>

      {/* ════════════ STAGE 1: INTRO (EXACT MATCH) ════════════ */}
      {stage === 'intro' && (
        <>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
            {/* Top ID Icon Circle */}
            <View style={styles.heroWrap}>
              <View style={styles.heroCircle}>
                <Ionicons name="id-card-outline" size={36} color="#111111" />
              </View>
              <Text style={styles.title}>Let's confirm it's you</Text>
              <Text style={styles.subtitle}>
                Financial regulations require us to verify your identity before you send money
                abroad. It takes about 2 minutes.
              </Text>
            </View>

            {/* 3-Item Checklist Card */}
            <View style={styles.checklistCard}>
              <View style={styles.checkRow}>
                <View style={styles.checkIconBox}>
                  <Ionicons name="id-card-outline" size={18} color="#374151" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.checkTitle}>A valid photo ID</Text>
                  <Text style={styles.checkSub}>
                    Passport, national ID, driver's licence or residence permit
                  </Text>
                </View>
              </View>

              <View style={styles.rowDivider} />

              <View style={styles.checkRow}>
                <View style={styles.checkIconBox}>
                  <MaterialCommunityIcons name="face-recognition" size={18} color="#374151" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.checkTitle}>A quick selfie</Text>
                  <Text style={styles.checkSub}>We match it to the photo on your ID</Text>
                </View>
              </View>

              <View style={styles.rowDivider} />

              <View style={styles.checkRow}>
                <View style={styles.checkIconBox}>
                  <Ionicons name="sunny-outline" size={18} color="#374151" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.checkTitle}>Good lighting</Text>
                  <Text style={styles.checkSub}>No glare, all four corners visible</Text>
                </View>
              </View>
            </View>

            {/* Issuing Country Card */}
            <TouchableOpacity
              style={styles.countryCard}
              activeOpacity={0.8}
              onPress={() => setCountryModalVisible(true)}
            >
              <View style={styles.countryBadge}>
                <Text style={styles.countryBadgeText}>{country.code}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.countryTitle}>ID issued in {country.name}</Text>
                <Text style={styles.countrySub}>Tap to change the issuing country</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
            </TouchableOpacity>

            {/* Encrypted Privacy Note */}
            <Text style={styles.privacyNote}>
              Your documents are encrypted and used only for verification.{'\n'}
              <Text
                style={styles.privacyLink}
                onPress={() =>
                  Alert.alert(
                    'Privacy Policy',
                    'Your ID and biometric selfie are encrypted with AES-256 and used solely to comply with KYC/AML regulations.',
                  )
                }
              >
                Privacy Policy
              </Text>
            </Text>
          </ScrollView>

          <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
            <TouchableOpacity
              style={styles.primaryBtn}
              activeOpacity={0.85}
              onPress={startVerification}
            >
              <Text style={styles.primaryBtnText}>Start verification</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* ════════════ STAGE 2: PHOTO ID CAPTURE ════════════ */}
      {stage === 'id_capture' && (
        <View style={styles.captureContainer}>
          {/* Document type pills */}
          <View style={styles.docTabs}>
            {[
              { id: 'passport', label: 'Passport' },
              { id: 'national_id', label: 'National ID' },
              { id: 'drivers_license', label: 'Driver Licence' },
            ].map((d) => {
              const active = docType === d.id;
              return (
                <TouchableOpacity
                  key={d.id}
                  style={[styles.docTab, active && styles.docTabActive]}
                  onPress={() => setDocType(d.id as DocType)}
                >
                  <Text style={[styles.docTabText, active && styles.docTabTextActive]}>
                    {d.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.captureTitle}>
            Position your {docType.replace('_', ' ')} ({country.code})
          </Text>
          <Text style={styles.captureSub}>
            Make sure all four corners are inside the frame with no glare.
          </Text>

          <View style={styles.idFrame}>
            {hasCameraPerm ? (
              <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing="back" />
            ) : (
              <View style={styles.mockCam}>
                <Ionicons name="id-card-outline" size={64} color="#9CA3AF" />
                <Text style={styles.mockCamText}>Camera preview ready</Text>
              </View>
            )}
            <View style={[styles.corner, styles.cTL]} />
            <View style={[styles.corner, styles.cTR]} />
            <View style={[styles.corner, styles.cBL]} />
            <View style={[styles.corner, styles.cBR]} />
          </View>

          <View style={{ flex: 1 }} />

          <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
            <TouchableOpacity
              style={styles.primaryBtn}
              activeOpacity={0.85}
              disabled={processing}
              onPress={handleCaptureId}
            >
              {processing ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryBtnText}>
                  {idCaptured ? 'ID Captured — Next' : 'Capture Photo ID'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* ════════════ STAGE 3: QUICK SELFIE ════════════ */}
      {stage === 'selfie' && (
        <View style={styles.captureContainer}>
          <Text style={styles.captureTitle}>Take a quick selfie</Text>
          <Text style={styles.captureSub}>
            Look straight at the camera. We'll match your face to your {country.code} ID.
          </Text>

          <View style={styles.selfieCircle}>
            {hasCameraPerm ? (
              <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing="front" />
            ) : (
              <View style={styles.mockCam}>
                <MaterialCommunityIcons name="face-recognition" size={72} color={Colors.primary} />
                <Text style={styles.mockCamText}>Front camera ready</Text>
              </View>
            )}
          </View>

          {processing && (
            <Text style={styles.matchingText}>Matching selfie with your ID photo...</Text>
          )}

          <View style={{ flex: 1 }} />

          <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
            <TouchableOpacity
              style={styles.primaryBtn}
              activeOpacity={0.85}
              disabled={processing}
              onPress={handleCaptureSelfie}
            >
              {processing ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryBtnText}>
                  {selfieCaptured ? 'Verified!' : 'Take Selfie & Verify'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* ════════════ STAGE 4: VERIFIED ════════════ */}
      {stage === 'verified' && (
        <View style={styles.verifiedWrap}>
          <View style={styles.verifiedCircle}>
            <Ionicons name="checkmark-circle" size={68} color="#16A34A" />
          </View>
          <Text style={styles.verifiedTitle}>Identity Verified!</Text>
          <Text style={styles.verifiedSub}>
            Your {country.name} ID and selfie matched. You can now send money abroad with full
            limits.
          </Text>

          <View style={styles.limitsCard}>
            <View style={styles.limitRow}>
              <Text style={styles.limitLabel}>Daily Send Limit</Text>
              <Text style={styles.limitVal}>$10,000 USD</Text>
            </View>
            <View style={styles.rowDivider} />
            <View style={styles.limitRow}>
              <Text style={styles.limitLabel}>Monthly Send Limit</Text>
              <Text style={styles.limitVal}>$50,000 USD</Text>
            </View>
          </View>

          <View style={{ flex: 1 }} />

          <View style={[styles.footer, { width: '100%', paddingBottom: Math.max(insets.bottom, 16) }]}>
            <TouchableOpacity style={styles.primaryBtn} onPress={() => router.back()}>
              <Text style={styles.primaryBtnText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Issuing Country Picker Modal */}
      <Modal visible={countryModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Issuing Country</Text>
              <TouchableOpacity onPress={() => setCountryModalVisible(false)}>
                <Text style={styles.modalDone}>Done</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={COUNTRIES}
              keyExtractor={(item) => item.code}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => {
                const selected = item.code === country.code;
                return (
                  <TouchableOpacity
                    style={[styles.countryOption, selected && styles.countryOptionSelected]}
                    onPress={() => {
                      setCountry(item);
                      setCountryModalVisible(false);
                    }}
                  >
                    <View
                      style={[
                        styles.codeBox,
                        selected ? { backgroundColor: Colors.primary } : { backgroundColor: '#F3F4F6' },
                      ]}
                    >
                      <Text style={[styles.codeBoxText, selected && { color: '#FFFFFF' }]}>
                        {item.code}
                      </Text>
                    </View>
                    <Text style={styles.countryOptionName}>{item.name}</Text>
                    {selected && <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />}
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
  backBtn: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 20,
  },
  heroWrap: {
    alignItems: 'center',
    marginBottom: 22,
  },
  heroCircle: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: '#FDF2F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111111',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 19,
    paddingHorizontal: 10,
  },
  checklistCard: {
    borderWidth: 1,
    borderColor: '#ECEEF2',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: '#FFFFFF',
    marginBottom: 14,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  checkIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#FDF2F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111111',
    marginBottom: 2,
  },
  checkSub: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
  },
  rowDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
  },
  countryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ECEEF2',
    borderRadius: 16,
    padding: 14,
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
  },
  countryBadge: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#111111',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  countryBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  countryTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111111',
  },
  countrySub: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  privacyNote: {
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 17,
  },
  privacyLink: {
    color: Colors.primary,
    textDecorationLine: 'underline',
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: 18,
    paddingTop: 10,
  },
  primaryBtn: {
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  /* Capture Stages */
  captureContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 18,
    alignItems: 'center',
  },
  docTabs: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 18,
  },
  docTab: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
  },
  docTabActive: {
    backgroundColor: Colors.primary,
  },
  docTabText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4B5563',
  },
  docTabTextActive: {
    color: '#FFFFFF',
  },
  captureTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#111111',
    marginBottom: 6,
    textAlign: 'center',
  },
  captureSub: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  idFrame: {
    width: '100%',
    height: 210,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selfieCircle: {
    width: 230,
    height: 230,
    borderRadius: 115,
    borderWidth: 4,
    borderColor: Colors.primary,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
    marginBottom: 18,
  },
  mockCam: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mockCamText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
  },
  matchingText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  corner: {
    position: 'absolute',
    width: 26,
    height: 26,
    borderColor: Colors.primary,
  },
  cTL: { top: 12, left: 12, borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: 6 },
  cTR: { top: 12, right: 12, borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: 6 },
  cBL: { bottom: 12, left: 12, borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: 6 },
  cBR: { bottom: 12, right: 12, borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: 6 },
  /* Verified Stage */
  verifiedWrap: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 36,
  },
  verifiedCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#DCFCE7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },
  verifiedTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111111',
    marginBottom: 8,
  },
  verifiedSub: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 24,
  },
  limitsCard: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ECEEF2',
    borderRadius: 16,
    paddingHorizontal: 16,
  },
  limitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  limitLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  limitVal: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111111',
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
    maxHeight: '75%',
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
    marginBottom: 12,
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
  countryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginBottom: 4,
  },
  countryOptionSelected: {
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
  codeBoxText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#111111',
  },
  countryOptionName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: '#111111',
  },
});
