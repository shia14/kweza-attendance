import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';

const COLORS = {
  primary: '#2A52BE',
  background: '#FFEBCD',
};

const QR_VALUE = 'KWEZA-ATTENDANCE-CHECKIN';
const API_BASE =
  process.env.EXPO_PUBLIC_API_BASE || 'http://10.0.2.2:5000';

export default function App() {
  const [screen, setScreen] = useState('login');
  const [name, setName] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [errors, setErrors] = useState({});
  const [arrival, setArrival] = useState(null);
  const [departure, setDeparture] = useState(null);
  const [scanMode, setScanMode] = useState(null);
  const [scanError, setScanError] = useState('');
  const [scanLoading, setScanLoading] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

  const validate = () => {
    const nextErrors = {};
    if (!name.trim()) nextErrors.name = 'Required';
    if (!idNumber.trim()) nextErrors.idNumber = 'Required';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleLogin = () => {
    if (!validate()) return;
    setScreen('scan');
  };

  const startScan = async (mode) => {
    setScanMode(mode);
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
      setScanMode(null);
      return;
    }

    const result = await recordScan({
      name: name.trim(),
      idNumber: idNumber.trim(),
      scanType: scanMode,
      qrValue: data,
    });

    if (!result) {
      setScanMode(null);
      return;
    }

    const timestamp = new Date(result.scannedAt).toLocaleString();
    const payload = { data, time: timestamp };

    if (scanMode === 'arrival') {
      setArrival(payload);
    } else {
      setDeparture(payload);
    }

    setScanMode(null);
  };

  if (screen === 'login') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Kweza Attendance</Text>
          <Text style={styles.subtitle}>Log in to scan the QR code</Text>

          <TextInput
            style={styles.input}
            placeholder="Full name"
            placeholderTextColor={COLORS.primary}
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />
          {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}

          <TextInput
            style={styles.input}
            placeholder="ID / Mobile number"
            placeholderTextColor={COLORS.primary}
            value={idNumber}
            onChangeText={setIdNumber}
          />
          {errors.idNumber ? (
            <Text style={styles.errorText}>{errors.idNumber}</Text>
          ) : null}

          <Pressable style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Log in</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Scan Attendance</Text>
        <Text style={styles.subtitle}>{`${name}  |  ID: ${idNumber}`}</Text>
        <Text style={styles.instructions}>
          Scan once when you arrive and once when you leave.
        </Text>

        {scanMode ? (
          <View style={styles.scanPanel}>
            {permission && permission.granted ? (
              <>
                <CameraView
                  style={styles.camera}
                  onBarcodeScanned={handleBarcodeScanned}
                  barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
                  facing="back"
                />
                <Text style={styles.scanHint}>
                  Scanning {scanMode === 'arrival' ? 'arrival' : 'departure'} QR code...
                </Text>
              </>
            ) : (
              <View style={styles.permissionBox}>
                <Text style={styles.subtitle}>
                  We need your permission to use the camera.
                </Text>
                <Pressable style={styles.button} onPress={requestPermission}>
                  <Text style={styles.buttonText}>Allow camera</Text>
                </Pressable>
              </View>
            )}
            {scanLoading ? (
              <Text style={styles.scanHint}>Recording scan...</Text>
            ) : null}
            {scanError ? (
              <Text style={styles.scanError}>{scanError}</Text>
            ) : null}
            <Pressable style={styles.secondaryButton} onPress={() => setScanMode(null)}>
              <Text style={styles.secondaryButtonText}>Cancel</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <Pressable style={styles.button} onPress={() => startScan('arrival')}>
              <Text style={styles.buttonText}>Scan Arrival</Text>
            </Pressable>
            <Pressable style={styles.button} onPress={() => startScan('departure')}>
              <Text style={styles.buttonText}>Scan Departure</Text>
            </Pressable>
          </>
        )}

        <View style={styles.statusBlock}>
          <Text style={styles.statusText}>
            {arrival
              ? `Arrival: ${arrival.data} at ${arrival.time}`
              : 'Arrival: Not scanned yet'}
          </Text>
          <Text style={styles.statusText}>
            {departure
              ? `Departure: ${departure.data} at ${departure.time}`
              : 'Departure: Not scanned yet'}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    padding: 24,
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.primary,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.primary,
  },
  instructions: {
    fontSize: 15,
    color: COLORS.primary,
    marginTop: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: COLORS.primary,
  },
  errorText: {
    color: COLORS.primary,
    fontSize: 12,
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: COLORS.background,
    fontWeight: '600',
    fontSize: 16,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  secondaryButtonText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  scanPanel: {
    marginTop: 8,
  },
  camera: {
    width: '100%',
    height: 320,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  scanHint: {
    marginTop: 8,
    color: COLORS.primary,
    fontSize: 14,
  },
  scanError: {
    marginTop: 8,
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  permissionBox: {
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 12,
  },
  statusBlock: {
    marginTop: 16,
    gap: 6,
  },
  statusText: {
    color: COLORS.primary,
    fontSize: 14,
  },
});
