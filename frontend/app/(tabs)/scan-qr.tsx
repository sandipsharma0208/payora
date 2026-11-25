import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  Modal,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/theme/colors';

const { width } = Dimensions.get('window');

export default function ScanQrScreen() {
  const router = useRouter();
  const [balanceVisible, setBalanceVisible] = useState(false);
  const [myQrVisible, setMyQrVisible] = useState(false);

  // Animated laser scan line
  const scanAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanAnim, {
          toValue: 200,
          duration: 1800,
          useNativeDriver: true,
        }),
        Animated.timing(scanAnim, {
          toValue: 0,
          duration: 1800,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  return (
    <View style={styles.container}>
      {/* Top Half: Magenta Gradient Landscape Header */}
      <LinearGradient
        colors={['#E91E63', '#D81B60', '#C2185B']}
        style={styles.headerLandscape}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.8, y: 1 }}
      >
        <SafeAreaView edges={['top']} style={styles.safeArea}>
          <View style={styles.topBar}>
            <View style={styles.userSection}>
              <Image
                source={{
                  uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
                }}
                style={styles.avatar}
              />
              <View style={styles.userInfo}>
                <Text style={styles.userName}>Noor Mohammad</Text>
                <TouchableOpacity
                  style={styles.balancePill}
                  activeOpacity={0.8}
                  onPress={() => setBalanceVisible(!balanceVisible)}
                >
                  <View style={styles.balanceIconCircle}>
                    <Text style={styles.balanceCoinSymbol}>৳</Text>
                  </View>
                  <Text style={styles.balancePillText}>
                    {balanceVisible ? '$2,458.50' : 'Tap for Balance'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.topRightActions}>
              <TouchableOpacity style={styles.headerIconButton} activeOpacity={0.7}>
                <Ionicons name="search" size={20} color="#FFFFFF" />
              </TouchableOpacity>

              <Image source={require("../../assets/payora.png")} style={styles.brandBadge} />
            </View>
          </View>

          {/* Decorative Landscape Elements */}
          <View style={styles.landscapeVector}>
            <View style={styles.landscapeHill1} />
            <View style={styles.landscapeHill2} />
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* Main Content Sheet with Rounded Top */}
      <View style={styles.sheetContainer}>
        <View style={styles.content}>
          <Text style={styles.title}>Scan Payora QR</Text>

          {/* QR Viewfinder Box */}
          <View style={styles.scannerFrame}>
            {/* Corner Brackets */}
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />

            {/* Mock QR Code Image with Payora Center Badge */}
            <View style={styles.qrInnerBox}>
              <Ionicons name="qr-code" size={170} color="#1E293B" />
              <Image source={require("../../assets/payora.png")} style={styles.qrCenterBadge} />
            </View>

            {/* Sweeping Animated Scan Line */}
            <Animated.View
              style={[
                styles.scanLaser,
                {
                  transform: [{ translateY: scanAnim }],
                },
              ]}
            />
          </View>

          <Text style={styles.instruction}>
            Align QR code within the frame to scan.
          </Text>

          {/* Action Buttons */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.actionButton}
              activeOpacity={0.75}
              onPress={() => router.push('/send/pick')}
            >
              <Text style={styles.actionButtonText}>Enter code manually</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              activeOpacity={0.75}
              onPress={() => setMyQrVisible(true)}
            >
              <Text style={styles.actionButtonText}>My QR Code</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* My QR Code Modal */}
      <Modal visible={myQrVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>My Payora QR</Text>
              <TouchableOpacity onPress={() => setMyQrVisible(false)}>
                <Ionicons name="close-circle-outline" size={28} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalQrContainer}>
              <Ionicons name="qr-code" size={190} color="#111111" />
              <Image source={require("../../assets/payora.png")} style={styles.qrCenterBadge} />
            </View>

            <Text style={styles.modalName}>Noor Mohammad</Text>
            <Text style={styles.modalPhone}>+1 415 555 0134</Text>
            <Text style={styles.modalSub}>Scan to pay me instantly on Payora</Text>

            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setMyQrVisible(false)}
            >
              <Text style={styles.modalCloseText}>Done</Text>
            </TouchableOpacity>
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
  headerLandscape: {
    paddingBottom: 24,
    position: 'relative',
    overflow: 'hidden',
  },
  safeArea: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    marginRight: 10,
  },
  userInfo: {
    justifyContent: 'center',
  },
  userName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  balancePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  balanceIconCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  balanceCoinSymbol: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  balancePillText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  topRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  brandBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandBadgeText: {
    color: '#111111',
    fontSize: 20,
    fontWeight: '900',
  },
  landscapeVector: {
    height: 30,
    marginTop: 10,
  },
  landscapeHill1: {
    position: 'absolute',
    bottom: -15,
    left: -20,
    width: 240,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  landscapeHill2: {
    position: 'absolute',
    bottom: -20,
    right: -10,
    width: 260,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  sheetContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -16,
    paddingTop: 20,
    paddingHorizontal: 24,
  },
  content: {
    alignItems: 'center',
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111111',
    marginBottom: 24,
  },
  scannerFrame: {
    width: 240,
    height: 240,
    backgroundColor: '#F3F4F6',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  corner: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderColor: '#6B7280',
  },
  cornerTL: {
    top: 14,
    left: 14,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 8,
  },
  cornerTR: {
    top: 14,
    right: 14,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 8,
  },
  cornerBL: {
    bottom: 14,
    left: 14,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 8,
  },
  cornerBR: {
    bottom: 14,
    right: 14,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 8,
  },
  qrInnerBox: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  qrCenterBadge: {
    position: 'absolute',
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  qrCenterText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
  },
  scanLaser: {
    position: 'absolute',
    left: 20,
    right: 20,
    top: 20,
    height: 3,
    backgroundColor: Colors.primary,
    borderRadius: 2,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 4,
  },
  instruction: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 20,
    marginBottom: 24,
  },
  actions: {
    width: '100%',
  },
  actionButton: {
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 24,
    alignItems: 'center',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111111',
  },
  modalQrContainer: {
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 12,
    position: 'relative',
  },
  modalName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111111',
    marginTop: 8,
  },
  modalPhone: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  modalSub: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 6,
    marginBottom: 20,
  },
  modalCloseButton: {
    width: '100%',
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
