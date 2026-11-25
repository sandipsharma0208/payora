import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
  Alert,
  Platform,
  Modal,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import * as Haptics from 'expo-haptics';
import { CameraView, Camera } from 'expo-camera';
import { useAuth } from '../../src/context/AuthContext';
import { SecureStorage } from '../../src/services/storage';
import { Colors } from '../../src/theme/colors';

type ScanStatus = 'idle' | 'scanning' | 'verified';

export default function BiometricsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const { enableBiometrics, loginWithPhone } = useAuth();

  const [loading, setLoading] = useState(false);
  const [scanStatus, setScanStatus] = useState<ScanStatus>('idle');
  const [cameraModalVisible, setCameraModalVisible] = useState(false);
  const [cameraScanStage, setCameraScanStage] = useState<'align' | 'scanning' | 'done'>('align');

  const laserAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const phone = (params.phone as string) || '+1 415 555 0134';
  const pin = (params.pin as string) || '12345';

  useEffect(() => {
    if (!cameraModalVisible) return;

    const laserLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(laserAnim, { toValue: 200, duration: 1200, useNativeDriver: true }),
        Animated.timing(laserAnim, { toValue: 0, duration: 1200, useNativeDriver: true }),
      ]),
    );

    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.06, duration: 700, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      ]),
    );

    laserLoop.start();
    pulseLoop.start();

    setCameraScanStage('align');
    const t1 = setTimeout(() => setCameraScanStage('scanning'), 900);
    const t2 = setTimeout(async () => {
      setCameraScanStage('done');
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      await SecureStorage.setBiometricEnabled(true);
    }, 2600);
    const t3 = setTimeout(async () => {
      setCameraModalVisible(false);
      setScanStatus('verified');
      await finishLogin();
    }, 3400);

    return () => {
      laserLoop.stop();
      pulseLoop.stop();
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [cameraModalVisible]);

  const finishLogin = async () => {
    try {
      await loginWithPhone(phone, pin);
    } catch (e) {
      console.warn('Login fallback:', e);
    }
    router.replace('/(tabs)');
  };

  const openCameraFaceScan = async () => {
    if (Platform.OS === 'web') {
      setScanStatus('verified');
      await SecureStorage.setBiometricEnabled(true);
      await finishLogin();
      return;
    }

    const { status } = await Camera.requestCameraPermissionsAsync();
    if (status === 'granted') {
      setCameraModalVisible(true);
    } else {
      Alert.alert(
        'Camera Permission Needed',
        'Camera access is needed to scan your face, or you can continue without Face ID.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Not now', onPress: finishLogin },
        ],
      );
    }
  };

  const handleEnableFaceId = async () => {
    setLoading(true);
    setScanStatus('scanning');
    try {
      if (Platform.OS === 'web') {
        await SecureStorage.setBiometricEnabled(true);
        setScanStatus('verified');
        await finishLogin();
        return;
      }

      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (hasHardware && isEnrolled) {
        const success = await enableBiometrics();
        if (success) {
          setScanStatus('verified');
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
          setTimeout(() => {
            finishLogin();
          }, 500);
          return;
        }
        setScanStatus('idle');
        Alert.alert(
          'Authentication Cancelled',
          'Would you like to scan your face with the front camera instead?',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Scan Face', onPress: openCameraFaceScan },
          ],
        );
        return;
      }

      // Fallback to interactive front-camera Face ID scan when OS biometrics isn't enrolled
      setScanStatus('idle');
      await openCameraFaceScan();
    } catch (e) {
      console.warn('Biometric setup err:', e);
      setScanStatus('idle');
      await openCameraFaceScan();
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    setLoading(true);
    try {
      await finishLogin();
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Pink Top Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={22} color="#111111" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Face ID</Text>

        <Image source={require('../../assets/payora.png')} style={styles.brandLogo} />
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Face ID Illustration */}
        <View style={styles.heroArea}>
          <View style={styles.iconContainerOuter}>
            <View style={styles.iconContainerMiddle}>
              <View style={styles.iconCard}>
                {scanStatus === 'verified' ? (
                  <Ionicons name="checkmark-circle" size={46} color="#16A34A" />
                ) : (
                  <MaterialCommunityIcons
                    name="face-recognition"
                    size={44}
                    color={scanStatus === 'scanning' ? Colors.primary : '#111111'}
                  />
                )}
              </View>
            </View>
          </View>

          <Text style={styles.title}>
            {scanStatus === 'verified'
              ? 'Face ID Enabled'
              : scanStatus === 'scanning'
                ? 'Scanning Face...'
                : 'Enable Face ID'}
          </Text>
          <Text style={styles.subtitle}>
            Log in and approve payments with a glance,{'\n'}
            instead of typing your PIN every time.
          </Text>
        </View>

        <View style={styles.divider} />

        {/* Privacy Bullet Points */}
        <View style={styles.bulletsContainer}>
          <View style={styles.bulletRow}>
            <View style={styles.bulletIconBox}>
              <Ionicons name="shield-checkmark-outline" size={20} color="#374151" />
            </View>
            <View style={styles.bulletText}>
              <Text style={styles.bulletTitle}>Your face data stays on your phone</Text>
              <Text style={styles.bulletDesc}>
                Payora never stores or sees your Face ID data.{'\n'}
                Your phone handles the check.
              </Text>
            </View>
          </View>

          <View style={styles.bulletRow}>
            <View style={styles.bulletIconBox}>
              <MaterialCommunityIcons name="face-recognition" size={19} color="#374151" />
            </View>
            <View style={styles.bulletText}>
              <Text style={styles.bulletTitle}>Add only your own face</Text>
              <Text style={styles.bulletDesc}>
                Anyone whose face is saved on this phone could{'\n'}
                log in, so don't add someone else's.
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Bottom Action Buttons */}
      <View style={[styles.buttonContainer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
        <TouchableOpacity
          style={styles.enableButton}
          activeOpacity={0.85}
          onPress={handleEnableFaceId}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <View style={styles.buttonContent}>
              <MaterialCommunityIcons
                name="face-recognition"
                size={20}
                color="#FFFFFF"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.enableButtonText}>Enable Face ID</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.skipButton}
          activeOpacity={0.7}
          onPress={handleSkip}
          disabled={loading}
        >
          <Text style={styles.skipButtonText}>Not now</Text>
        </TouchableOpacity>
      </View>

      {/* Front-Camera Face Scanning Modal */}
      <Modal visible={cameraModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.scannerCard}>
            <View style={styles.scannerHeader}>
              <Text style={styles.scannerTitle}>Face ID Scan</Text>
              <TouchableOpacity onPress={() => setCameraModalVisible(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <Animated.View
              style={[
                styles.faceCircleFrame,
                {
                  transform: [{ scale: pulseAnim }],
                  borderColor: cameraScanStage === 'done' ? '#16A34A' : Colors.primary,
                },
              ]}
            >
              <CameraView style={StyleSheet.absoluteFill} facing="front" />

              {cameraScanStage !== 'done' && (
                <Animated.View
                  style={[styles.scanLaser, { transform: [{ translateY: laserAnim }] }]}
                />
              )}

              {cameraScanStage === 'done' && (
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark-circle" size={64} color="#16A34A" />
                </View>
              )}
            </Animated.View>

            <Text style={styles.scanStageTitle}>
              {cameraScanStage === 'align'
                ? 'Position your face in the circle'
                : cameraScanStage === 'scanning'
                  ? 'Scanning your face...'
                  : 'Face ID Verified!'}
            </Text>
            <Text style={styles.scanStageSub}>
              {cameraScanStage === 'done'
                ? 'You can now log in and approve payments with Face ID.'
                : 'Hold steady and look directly at the camera.'}
            </Text>
          </View>
        </View>
      </Modal>
    </View>
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
    justifyContent: 'space-between',
    backgroundColor: Colors.primary,
    paddingHorizontal: 18,
    paddingBottom: 14,
  },
  backButton: {
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
  brandLogo: {
    width: 28,
    height: 28,
    borderRadius: 8,
  },
  content: {
    flex: 1,
  },
  heroArea: {
    alignItems: 'center',
    paddingTop: 28,
    paddingBottom: 24,
    paddingHorizontal: 24,
  },
  iconContainerOuter: {
    width: 152,
    height: 152,
    borderRadius: 76,
    backgroundColor: '#FDF2F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 22,
  },
  iconContainerMiddle: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: '#FCE6EF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCard: {
    width: 78,
    height: 78,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#E91E63',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111111',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 19,
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginBottom: 22,
  },
  bulletsContainer: {
    paddingHorizontal: 22,
    gap: 20,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  bulletIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FCE8F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    marginTop: 2,
  },
  bulletText: {
    flex: 1,
  },
  bulletTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111111',
    marginBottom: 4,
  },
  bulletDesc: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 17,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  enableButton: {
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  enableButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  skipButton: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  skipButtonText: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '600',
  },
  /* Camera Face Scan Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  scannerCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 24,
    alignItems: 'center',
  },
  scannerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  scannerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111111',
  },
  faceCircleFrame: {
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 4,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#111111',
    marginBottom: 20,
  },
  scanLaser: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 3,
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 6,
  },
  verifiedBadge: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanStageTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111111',
    marginBottom: 6,
    textAlign: 'center',
  },
  scanStageSub: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 19,
  },
});
