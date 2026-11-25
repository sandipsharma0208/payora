import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Image,
  Animated,
  Alert,
  Platform,
  Vibration,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CameraView, Camera, BarcodeScanningResult } from 'expo-camera';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/theme/colors';

// ─── QR data shape we expect: payora://pay?to=NAME&amount=AMOUNT&ref=REF ───
interface QRPayment {
  to: string;
  amount?: string;
  ref?: string;
  phone?: string;
  raw: string;
}

function parseQR(data: string): QRPayment {
  try {
    if (data.startsWith('payora://') || data.startsWith('https://payora')) {
      const url = new URL(data.replace('payora://', 'https://payora.app/'));
      return {
        to: url.searchParams.get('to') || 'Unknown',
        amount: url.searchParams.get('amount') || undefined,
        ref: url.searchParams.get('ref') || undefined,
        phone: url.searchParams.get('phone') || undefined,
        raw: data,
      };
    }
    // Try JSON
    const json = JSON.parse(data);
    return {
      to: json.name || json.to || 'Unknown',
      amount: json.amount ? String(json.amount) : undefined,
      ref: json.ref || undefined,
      phone: json.phone || undefined,
      raw: data,
    };
  } catch {
    return { to: data.slice(0, 24), raw: data };
  }
}

export default function ScanQrScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [hasCamPermission, setHasCamPermission] = useState<boolean | null>(null);
  const [torchOn, setTorchOn] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [myQrVisible, setMyQrVisible] = useState(false);
  const [resultVisible, setResultVisible] = useState(false);
  const [qrData, setQrData] = useState<QRPayment | null>(null);

  // Animated laser line
  const scanAnim = useRef(new Animated.Value(0)).current;
  const scanLoop = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasCamPermission(status === 'granted');
    })();
  }, []);

  useEffect(() => {
    if (!scanned) {
      scanLoop.current = Animated.loop(
        Animated.sequence([
          Animated.timing(scanAnim, { toValue: 220, duration: 2000, useNativeDriver: true }),
          Animated.timing(scanAnim, { toValue: 0, duration: 2000, useNativeDriver: true }),
        ]),
      );
      scanLoop.current.start();
    } else {
      scanLoop.current?.stop();
    }
    return () => scanLoop.current?.stop();
  }, [scanned]);

  const handleBarCodeScanned = ({ type, data }: BarcodeScanningResult) => {
    if (scanned) return;
    setScanned(true);
    Vibration.vibrate(80);
    const parsed = parseQR(data);
    setQrData(parsed);
    setResultVisible(true);
  };

  const handleRescan = () => {
    setScanned(false);
    setResultVisible(false);
    setQrData(null);
  };

  const handlePay = () => {
    setResultVisible(false);
    if (qrData?.amount) {
      router.push({
        pathname: '/send/confirm',
        params: {
          recipient: qrData.to,
          amount: qrData.amount,
          ref: qrData.ref ?? 'QR Pay',
        },
      });
    } else {
      router.push({
        pathname: '/send/amount',
        params: { recipient: qrData?.to ?? '' },
      });
    }
  };

  // ── Permission denied ──────────────────────────────────────
  if (hasCamPermission === false) {
    return (
      <View style={[styles.permDenied, { paddingTop: insets.top + 20 }]}>
        <Ionicons name="camera-outline" size={64} color="#E91E63" />
        <Text style={styles.permTitle}>Camera Access Needed</Text>
        <Text style={styles.permSub}>
          Please enable camera permission in your device Settings to scan QR codes.
        </Text>
        <TouchableOpacity
          style={styles.permBtn}
          onPress={() => Camera.requestCameraPermissionsAsync()}
        >
          <Text style={styles.permBtnText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Loading ────────────────────────────────────────────────
  if (hasCamPermission === null) {
    return (
      <View style={styles.permDenied}>
        <Ionicons name="camera-outline" size={48} color="#E91E63" />
        <Text style={styles.permSub}>Requesting camera permission…</Text>
      </View>
    );
  }

  // ── Main camera view ───────────────────────────────────────
  return (
    <View style={styles.root}>
      {/* Full-screen camera */}
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        enableTorch={torchOn}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      />

      {/* Dark overlay with square cutout */}
      <View style={styles.overlay}>
        {/* Top dark band */}
        <View style={[styles.overlayBand, { paddingTop: insets.top }]}>
          {/* Header row */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => router.back()}
              activeOpacity={0.8}
            >
              <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Scan QR</Text>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => setTorchOn((v) => !v)}
              activeOpacity={0.8}
            >
              <Ionicons
                name={torchOn ? 'flash' : 'flash-outline'}
                size={22}
                color={torchOn ? '#FFD600' : '#FFFFFF'}
              />
            </TouchableOpacity>
          </View>
          <Text style={styles.subtitle}>Align the QR code within the frame</Text>
        </View>

        {/* Middle row: dark left | transparent window | dark right */}
        <View style={styles.middleRow}>
          <View style={styles.sideShade} />

          {/* Scanner frame */}
          <View style={styles.frame}>
            {/* Pink corner brackets */}
            <View style={[styles.corner, styles.cTL]} />
            <View style={[styles.corner, styles.cTR]} />
            <View style={[styles.corner, styles.cBL]} />
            <View style={[styles.corner, styles.cBR]} />

            {/* Scan laser */}
            {!scanned && (
              <Animated.View
                style={[styles.laser, { transform: [{ translateY: scanAnim }] }]}
              />
            )}

            {/* Success overlay when scanned */}
            {scanned && (
              <View style={styles.successOverlay}>
                <Ionicons name="checkmark-circle" size={72} color="#4CAF50" />
                <Text style={styles.successText}>Scanned!</Text>
              </View>
            )}
          </View>

          <View style={styles.sideShade} />
        </View>

        {/* Bottom dark band */}
        <View style={styles.bottomBand}>
          {/* Action row */}
          <View style={styles.bottomActions}>
            <TouchableOpacity
              style={styles.bottomBtn}
              activeOpacity={0.8}
              onPress={() => setMyQrVisible(true)}
            >
              <View style={styles.bottomBtnIcon}>
                <Ionicons name="qr-code-outline" size={22} color="#FFFFFF" />
              </View>
              <Text style={styles.bottomBtnLabel}>My QR Code</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.bottomBtn}
              activeOpacity={0.8}
              onPress={() => router.push('/send/pick')}
            >
              <View style={styles.bottomBtnIcon}>
                <Ionicons name="keypad-outline" size={22} color="#FFFFFF" />
              </View>
              <Text style={styles.bottomBtnLabel}>Enter Manually</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.bottomBtn}
              activeOpacity={0.8}
              onPress={handleRescan}
            >
              <View style={styles.bottomBtnIcon}>
                <Ionicons name="refresh-outline" size={22} color="#FFFFFF" />
              </View>
              <Text style={styles.bottomBtnLabel}>Rescan</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* ── Scanned Result Bottom Sheet ── */}
      <Modal visible={resultVisible} transparent animationType="slide">
        <View style={styles.sheetOverlay}>
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />

            {/* Success icon */}
            <View style={styles.sheetIconRow}>
              <View style={styles.sheetIconCircle}>
                <Ionicons name="checkmark-circle" size={40} color="#4CAF50" />
              </View>
            </View>

            <Text style={styles.sheetTitle}>QR Code Scanned</Text>
            <Text style={styles.sheetSub}>Send payment to:</Text>

            {/* Recipient card */}
            <View style={styles.recipientCard}>
              <View style={styles.recipientAvatar}>
                <Ionicons name="person" size={28} color={Colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.recipientName}>{qrData?.to}</Text>
                {qrData?.phone && (
                  <Text style={styles.recipientPhone}>{qrData.phone}</Text>
                )}
                {qrData?.ref && (
                  <Text style={styles.recipientRef}>Ref: {qrData.ref}</Text>
                )}
              </View>
              {qrData?.amount && (
                <Text style={styles.recipientAmount}>${qrData.amount}</Text>
              )}
            </View>

            {/* Raw QR data */}
            <View style={styles.rawBox}>
              <Ionicons name="information-circle-outline" size={14} color="#9CA3AF" />
              <Text style={styles.rawText} numberOfLines={2}>
                {qrData?.raw}
              </Text>
            </View>

            {/* CTA buttons */}
            <TouchableOpacity style={styles.payBtn} activeOpacity={0.85} onPress={handlePay}>
              <Text style={styles.payBtnText}>
                {qrData?.amount ? `Pay $${qrData.amount}` : 'Enter Amount & Pay'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelBtn}
              activeOpacity={0.75}
              onPress={handleRescan}
            >
              <Text style={styles.cancelBtnText}>Scan Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ── My QR Code Modal ── */}
      <Modal visible={myQrVisible} transparent animationType="slide">
        <View style={styles.sheetOverlay}>
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <View style={styles.myQrHeader}>
              <Text style={styles.sheetTitle}>My Payora QR</Text>
              <TouchableOpacity onPress={() => setMyQrVisible(false)}>
                <Ionicons name="close-circle-outline" size={28} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {/* QR illustration with logo center */}
            <View style={styles.myQrBox}>
              <Ionicons name="qr-code" size={200} color="#111111" />
              <Image
                source={require('../../assets/payora.png')}
                style={styles.qrLogo}
              />
            </View>

            <Text style={styles.myQrName}>Noor Mohammad</Text>
            <Text style={styles.myQrPhone}>+1 415 555 0134</Text>
            <Text style={styles.myQrSub}>Scan to pay me instantly on Payora</Text>

            <TouchableOpacity
              style={styles.payBtn}
              onPress={() => setMyQrVisible(false)}
            >
              <Text style={styles.payBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const FRAME = 260;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000000',
  },
  /* Permission screens */
  permDenied: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  permTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111111',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  permSub: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  permBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 28,
  },
  permBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  /* Overlay */
  overlay: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'column',
  },
  overlayBand: {
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    marginBottom: 10,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 13,
    textAlign: 'center',
  },
  middleRow: {
    flexDirection: 'row',
    height: FRAME,
  },
  sideShade: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
  },
  /* Scanner frame */
  frame: {
    width: FRAME,
    height: FRAME,
    overflow: 'hidden',
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: Colors.primary,
  },
  cTL: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 6,
  },
  cTR: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 6,
  },
  cBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 6,
  },
  cBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 6,
  },
  laser: {
    position: 'absolute',
    top: 0,
    left: 10,
    right: 10,
    height: 2.5,
    backgroundColor: Colors.primary,
    borderRadius: 2,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 6,
  },
  successOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successText: {
    color: '#4CAF50',
    fontSize: 18,
    fontWeight: '800',
    marginTop: 8,
  },
  bottomBand: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingTop: 32,
    paddingHorizontal: 32,
  },
  bottomActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  bottomBtn: {
    alignItems: 'center',
  },
  bottomBtnIcon: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  bottomBtnLabel: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  /* Bottom sheets */
  sheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingBottom: 36,
    paddingTop: 12,
    alignItems: 'center',
  },
  sheetHandle: {
    width: 42,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    marginBottom: 20,
  },
  sheetIconRow: {
    marginBottom: 12,
  },
  sheetIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111111',
    marginBottom: 4,
  },
  sheetSub: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 16,
  },
  /* Recipient card */
  recipientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 14,
    width: '100%',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F0F0F2',
  },
  recipientAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FDE8EE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  recipientName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111111',
  },
  recipientPhone: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  recipientRef: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
  },
  recipientAmount: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.primary,
  },
  rawBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    padding: 10,
    width: '100%',
    marginBottom: 20,
    gap: 6,
  },
  rawText: {
    flex: 1,
    fontSize: 11,
    color: '#6B7280',
    lineHeight: 16,
  },
  /* Buttons */
  payBtn: {
    width: '100%',
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  payBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  cancelBtn: {
    width: '100%',
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#374151',
  },
  /* My QR */
  myQrHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
  },
  myQrBox: {
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    position: 'relative',
  },
  qrLogo: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  myQrName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111111',
    marginBottom: 2,
  },
  myQrPhone: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  myQrSub: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 20,
    textAlign: 'center',
  },
});
