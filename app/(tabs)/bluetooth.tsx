// app/(tabs)/bluetooth.tsx
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Device {
  id: string;
  name: string;
  rssi?: number;
}

export default function BluetoothScreen() {
  const [scanning, setScanning] = useState(false);
  const [connected, setConnected] = useState(false);
  const [devices, setDevices] = useState<Device[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
  const [hasPermissions, setHasPermissions] = useState(false);

  useEffect(() => {
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      try {
        if (Platform.Version >= 31) {
          const result = await PermissionsAndroid.requestMultiple([
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          ]);
          
          const allGranted = Object.values(result).every(
            val => val === PermissionsAndroid.RESULTS.GRANTED
          );
          setHasPermissions(allGranted);
          
          if (!allGranted) {
            Alert.alert(
              'Permissions Required',
              'Bluetooth permissions are required for this feature'
            );
          }
        } else {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
          );
          setHasPermissions(granted === PermissionsAndroid.RESULTS.GRANTED);
        }
      } catch (err) {
        console.warn('Permission error:', err);
        setHasPermissions(false);
      }
    } else {
      setHasPermissions(true);
    }
  };

  const scanForDevices = async () => {
    if (!hasPermissions) {
      Alert.alert('Error', 'Bluetooth permissions not granted');
      return;
    }

    setScanning(true);
    setDevices([]);
    
    Alert.alert(
      'Bluetooth Not Configured',
      'Bluetooth native modules need to be properly configured. Please run:\n\nnpx expo prebuild\nnpx expo run:android\n\nFor development, use a physical device.'
    );
    
    setScanning(false);
  };

  const connectToDevice = async (device: Device) => {
    Alert.alert('Connection', `Would connect to ${device.name}`);
  };

  const disconnect = async () => {
    setConnected(false);
    setConnectedDevice(null);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="bluetooth" size={48} color="#007AFF" />
        <Text style={styles.title}>Bluetooth Devices</Text>
        <Text style={styles.subtitle}>
          {connected ? `Connected to ${connectedDevice?.name}` : 'Not connected'}
        </Text>
      </View>

      {!hasPermissions && (
        <View style={styles.warningBox}>
          <Ionicons name="warning" size={24} color="#ff9500" />
          <Text style={styles.warningText}>
            Bluetooth permissions required. Please enable in settings.
          </Text>
        </View>
      )}

      {connected ? (
        <View style={styles.connectedSection}>
          <View style={styles.connectedCard}>
            <Ionicons name="checkmark-circle" size={64} color="#00ff00" />
            <Text style={styles.connectedName}>{connectedDevice?.name}</Text>
            <Text style={styles.connectedId}>{connectedDevice?.id}</Text>
            <TouchableOpacity
              style={[styles.button, styles.buttonDanger]}
              onPress={disconnect}
            >
              <Text style={styles.buttonText}>Disconnect</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <>
          <TouchableOpacity
            style={[styles.button, styles.buttonPrimary]}
            onPress={scanForDevices}
            disabled={scanning || !hasPermissions}
          >
            {scanning ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="search" size={20} color="#fff" />
                <Text style={styles.buttonText}>Scan for Devices</Text>
              </>
            )}
          </TouchableOpacity>

          {scanning && (
            <View style={styles.scanningIndicator}>
              <ActivityIndicator size="large" color="#007AFF" />
              <Text style={styles.scanningText}>Scanning for devices...</Text>
            </View>
          )}

          <ScrollView style={styles.deviceList}>
            {devices.length === 0 && !scanning && (
              <View style={styles.emptyState}>
                <Ionicons name="bluetooth-outline" size={64} color="#444" />
                <Text style={styles.emptyText}>No devices found</Text>
                <Text style={styles.emptySubtext}>Tap "Scan for Devices" to start</Text>
              </View>
            )}

            {devices.map(device => (
              <TouchableOpacity
                key={device.id}
                style={styles.deviceItem}
                onPress={() => connectToDevice(device)}
              >
                <View style={styles.deviceIcon}>
                  <Ionicons name="bluetooth" size={32} color="#007AFF" />
                </View>
                <View style={styles.deviceInfo}>
                  <Text style={styles.deviceName}>{device.name}</Text>
                  <Text style={styles.deviceId}>{device.id}</Text>
                  {device.rssi && (
                    <Text style={styles.deviceRssi}>Signal: {device.rssi} dBm</Text>
                  )}
                </View>
                <Ionicons name="chevron-forward" size={24} color="#888" />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </>
      )}

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          💡 Looking for "SmartGlass_Audio"
        </Text>
        <Text style={styles.footerSubtext}>
          Note: Requires native build (npx expo prebuild)
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    marginTop: 5,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    gap: 10,
  },
  warningText: {
    color: '#ff9500',
    fontSize: 14,
    flex: 1,
  },
  connectedSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  connectedCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    width: '100%',
    borderWidth: 2,
    borderColor: '#00ff00',
  },
  connectedName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 20,
  },
  connectedId: {
    fontSize: 12,
    color: '#888',
    marginTop: 5,
    marginBottom: 30,
  },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  buttonPrimary: {
    backgroundColor: '#007AFF',
  },
  buttonDanger: {
    backgroundColor: '#ff4444',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  scanningIndicator: {
    alignItems: 'center',
    marginVertical: 30,
  },
  scanningText: {
    color: '#888',
    marginTop: 10,
    fontSize: 14,
  },
  deviceList: {
    flex: 1,
    marginTop: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
  },
  emptySubtext: {
    color: '#888',
    fontSize: 14,
    marginTop: 5,
  },
  deviceItem: {
    backgroundColor: '#1a1a1a',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  deviceIcon: {
    width: 50,
    height: 50,
    backgroundColor: '#0a0a0a',
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  deviceId: {
    color: '#888',
    fontSize: 11,
    marginTop: 2,
  },
  deviceRssi: {
    color: '#888',
    fontSize: 12,
    marginTop: 4,
  },
  footer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    alignItems: 'center',
  },
  footerText: {
    color: '#888',
    fontSize: 12,
  },
  footerSubtext: {
    color: '#666',
    fontSize: 10,
    marginTop: 5,
  },
});