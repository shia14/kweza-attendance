import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';

const COLORS = {
  primary: '#2A52BE',
  background: '#FFFFFF',
  cardBg: '#EDF2F7',
  textMain: '#00263E',
  textSub: '#4A5568',
  inputBg: '#FFFFFF',
  border: '#E2E8F0',
};

const QR_VALUE = 'KWEZA-ATTENDANCE-CHECKIN';
const API_BASE =
  process.env.EXPO_PUBLIC_API_BASE || 'https://kweza-attendance.vercel.app'; // Make sure to use your local IP if testing on physical device

export default function App() {
  const [screen, setScreen] = useState('login');
  const [memberId, setMemberId] = useState('');
  const [pin, setPin] = useState('');
  const [workerName, setWorkerName] = useState('');
  const [errors, setErrors] = useState({});
  const [arrival, setArrival] = useState(null);
  const [departure, setDeparture] = useState(null);
  const [scanMode, setScanMode] = useState(false); // Changed to boolean for "is scanning"
  const [scanError, setScanError] = useState('');
  const [scanLoading, setScanLoading] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

  const validate = () => {
    const nextErrors = {};
    if (!memberId.trim()) nextErrors.memberId = 'Required';
    if (!pin.trim()) nextErrors.pin = 'Required';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoginLoading(true);
    setErrors({});

    try {
      const response = await fetch(`${API_BASE}/api/worker/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId: memberId.trim(), pin: pin.trim() }),
      });
      const result = await response.json();
      if (result.success) {
        setWorkerName(result.worker.name);
        setScreen('scan');
      } else {
        setErrors({ general: result.message || 'Invalid credentials' });
      }
    } catch (err) {
      setErrors({ general: 'Connection failed. Is the server running?' });
    } finally {
      setLoginLoading(false);
    }
  };

  const startScan = async () => {
    setScanMode(true);
    setScanError('');
    if (!permission?.granted) {
      await requestPermission();
    }
  };

  const recordScan = async (payload) => {
    setScanLoading(true);
    setScanError('');
    try {
      const response = await fetch(`${API_BASE}/api/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to record scan');
      }
      return result;
    } catch (err) {
      setScanError(err.message);
      return null;
    } finally {
      setScanLoading(false);
    }
  };

  const handleBarcodeScanned = async ({ data }) => {
    if (!scanMode) return;
    if (data !== QR_VALUE) {
      setScanError('Invalid QR code');
      setScanMode(false);
      return;
    }

    const result = await recordScan({
      name: workerName,
      idNumber: memberId.trim(),
      qrValue: data,
    });

    if (!result) {
      setScanMode(false);
      return;
    }

    const timestamp = new Date(result.scannedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const payload = { data, time: timestamp };

    if (result.scanType === 'arrival') {
      setArrival(payload);
    } else {
      setDeparture(payload);
    }

    setScanMode(false);
  };

  if (screen === 'login') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
            <View style={styles.headerSection}>
              <Image
                source={require('./assets/logo.png')}
                style={styles.logo}
                resizeMode="contain"
              />
              <Text style={styles.welcomeTitle}>Welcome to My Kweza</Text>
              <Text style={styles.welcomeSubtitle}>Secure portal for the Kweza Team</Text>
            </View>

            <View style={styles.loginCard}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Member ID</Text>
                <TextInput
                  style={[styles.input, errors.memberId && styles.inputError]}
                  placeholder="e.g. XOU-2028-003"
                  placeholderTextColor="#A0AEC0"
                  value={memberId}
                  onChangeText={setMemberId}
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>PIN Code</Text>
                <TextInput
                  style={[styles.input, errors.pin && styles.inputError]}
                  placeholder="••••"
                  placeholderTextColor="#A0AEC0"
                  value={pin}
                  onChangeText={setPin}
                  keyboardType="numeric"
                  secureTextEntry
                  maxLength={4}
                />
              </View>

              {errors.general ? (
                <Text style={styles.errorBanner}>{errors.general}</Text>
              ) : null}

              <Pressable
                style={({ pressed }) => [
                  styles.loginButton,
                  pressed && { opacity: 0.8 },
                  loginLoading && { opacity: 0.7 }
                ]}
                onPress={handleLogin}
                disabled={loginLoading}
              >
                <Text style={styles.loginButtonText}>
                  {loginLoading ? 'LOGGING IN...' : 'LOGIN TO ACCOUNT'}
                </Text>
              </Pressable>

              <View style={styles.footerInner}>
                <Text style={styles.footerText}>
                  Professional financial services for Malawi {'\n'} & Community.
                </Text>
                <Text style={styles.copyright}>© 2026 Kweza Pay. All rights reserved.</Text>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.scanContent}>
        <View style={styles.headerSection}>
          <Image
            source={require('./assets/logo.png')}
            style={styles.logoSmall}
            resizeMode="contain"
          />
          <Text style={styles.scanTitle}>Attendance Scan</Text>
          <Text style={styles.scanSubtitle}>{`${workerName} | ID: ${memberId}`}</Text>
        </View>

        {scanMode ? (
          <View style={styles.scanPanel}>
            {permission && permission.granted ? (
              <View style={styles.cameraWrapper}>
                <CameraView
                  style={styles.camera}
                  onBarcodeScanned={handleBarcodeScanned}
                  barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
                  facing="back"
                />
                <View style={styles.cameraOverlay}>
                  <View style={styles.scanFrame} />
                </View>
              </View>
            ) : (
              <View style={styles.permissionBox}>
                <Text style={styles.permissionText}>
                  Camera access is required to scan QR codes.
                </Text>
                <Pressable style={styles.loginButton} onPress={requestPermission}>
                  <Text style={styles.loginButtonText}>Enable Camera</Text>
                </Pressable>
              </View>
            )}

            {scanLoading && <Text style={styles.scanStatusLabel}>Recording scan...</Text>}
            {scanError ? <Text style={styles.scanErrorText}>{scanError}</Text> : null}

            <Pressable style={styles.cancelButton} onPress={() => setScanMode(false)}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.actionSection}>
            <View style={styles.statusCard}>
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>Morning Scan</Text>
                <Text style={[styles.statusValue, arrival && styles.statusActive]}>
                  {arrival ? arrival.time : '--:--'}
                </Text>
              </View>
              <View style={[styles.statusRow, { borderBottomWidth: 0 }]}>
                <Text style={styles.statusLabel}>Afternoon Scan</Text>
                <Text style={[styles.statusValue, departure && styles.statusActive]}>
                  {departure ? departure.time : '--:--'}
                </Text>
              </View>
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.scanButtonBig,
                pressed && { transform: [{ scale: 0.98 }] }
              ]}
              onPress={startScan}
            >
              <Text style={styles.scanButtonText}>TAP TO SCAN</Text>
              <Text style={styles.scanButtonSub}>Attendance QR Code</Text>
            </Pressable>

            <Pressable style={styles.logoutBtn} onPress={() => setScreen('login')}>
              <Text style={styles.logoutText}>Logout</Text>
            </Pressable>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  logoSmall: {
    width: 60,
    height: 60,
    marginBottom: 10,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.textMain,
    textAlign: 'center',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: COLORS.textSub,
    textAlign: 'center',
  },
  loginCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#718096',
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: COLORS.textMain,
  },
  inputError: {
    borderColor: '#E53E3E',
    backgroundColor: '#FFF5F5',
  },
  errorBanner: {
    color: '#E53E3E',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 15,
  },
  loginButton: {
    backgroundColor: '#2A52BE', // Matching the dark blue in image
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#2A52BE',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    marginTop: 10,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 1,
  },
  footerInner: {
    marginTop: 30,
    borderTopWidth: 1,
    borderTopColor: '#CBD5E0',
    paddingTop: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    color: COLORS.textSub,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 4,
  },
  copyright: {
    fontSize: 13,
    color: COLORS.textSub,
    fontWeight: '500',
  },
  // Scan Screen Styles
  scanContent: {
    flex: 1,
    padding: 24,
  },
  scanTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textMain,
  },
  scanSubtitle: {
    fontSize: 14,
    color: COLORS.textSub,
    marginTop: 4,
  },
  scanPanel: {
    flex: 1,
  },
  cameraWrapper: {
    flex: 1,
    maxHeight: 400,
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  scanFrame: {
    width: 200,
    height: 200,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  scanStatusLabel: {
    marginTop: 20,
    textAlign: 'center',
    color: COLORS.primary,
    fontWeight: '600',
  },
  scanErrorText: {
    marginTop: 15,
    textAlign: 'center',
    color: '#E53E3E',
    fontWeight: '600',
  },
  cancelButton: {
    marginTop: 20,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: COLORS.textSub,
    fontWeight: '600',
  },
  actionSection: {
    flex: 1,
    justifyContent: 'center',
    gap: 20,
  },
  statusCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  statusLabel: {
    fontSize: 16,
    color: COLORS.textSub,
    fontWeight: '600',
  },
  statusValue: {
    fontSize: 16,
    color: '#A0AEC0',
    fontWeight: 'bold',
  },
  statusActive: {
    color: '#10b981',
  },
  scanButtonBig: {
    backgroundColor: COLORS.primary,
    borderRadius: 100, // Circular button
    width: 180,
    height: 180,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 8,
    marginVertical: 40,
  },
  scanButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
  },
  scanButtonSub: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
    marginTop: 4,
  },
  permissionBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  permissionText: {
    textAlign: 'center',
    color: COLORS.textSub,
    marginBottom: 20,
    fontSize: 16,
  },
  logoutBtn: {
    alignSelf: 'center',
    padding: 10,
  },
  logoutText: {
    color: COLORS.textSub,
    textDecorationLine: 'underline',
  }
});
