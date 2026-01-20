import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
  PermissionsAndroid,
  Animated,
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
  const scanAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    requestPermissions();
  }, []);

  useEffect(() => {
    if (scanning) {
      Animated.loop(
        Animated.timing(scanAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        })
      ).start();
    } else {
      scanAnim.setValue(0);
    }
  }, [scanning]);

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

  const spin = scanAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View className="flex-1 bg-primary-black">
      {/* Header */}
      <View className="bg-secondary-black pt-12 pb-6 px-6 border-b border-card-black">
        <View className="items-center mb-4">
          <View className="bg-light-green/20 rounded-full p-4 mb-3">
            <Ionicons name="bluetooth" size={40} color="#00ff88" />
          </View>
          <Text className="text-2xl font-bold text-white">Bluetooth Devices</Text>
          <Text className="text-text-gray text-sm mt-1">
            {connected ? `Connected to ${connectedDevice?.name}` : 'Not connected'}
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-6">
        {/* Permission Warning */}
        {!hasPermissions && (
          <View className="mt-6 bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-4">
            <View className="flex-row items-start gap-3">
              <Ionicons name="warning" size={24} color="#fbbf24" />
              <View className="flex-1">
                <Text className="text-yellow-400 font-semibold mb-1">
                  Permissions Required
                </Text>
                <Text className="text-yellow-300/80 text-sm">
                  Bluetooth permissions are required. Please enable them in settings.
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Connected Device Card */}
        {connected ? (
          <View className="mt-6">
            <View className="bg-card-black border-2 border-light-green rounded-3xl p-6">
              <View className="items-center">
                <View className="bg-light-green/20 rounded-full p-6 mb-4">
                  <Ionicons name="checkmark-circle" size={48} color="#00ff88" />
                </View>
                <Text className="text-white text-2xl font-bold mb-1">
                  {connectedDevice?.name}
                </Text>
                <Text className="text-text-gray text-sm mb-6 font-mono">
                  {connectedDevice?.id}
                </Text>
                <TouchableOpacity
                  className="bg-red-500 rounded-xl px-8 py-4 w-full"
                  onPress={disconnect}
                  activeOpacity={0.7}
                >
                  <Text className="text-white text-center font-bold text-base">
                    Disconnect
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ) : (
          <>
            {/* Scan Button */}
            <TouchableOpacity
              className={`mt-6 rounded-2xl p-5 ${
                scanning || !hasPermissions
                  ? 'bg-card-black border border-gray-800'
                  : 'bg-light-green'
              }`}
              onPress={scanForDevices}
              disabled={scanning || !hasPermissions}
              activeOpacity={0.7}
            >
              <View className="flex-row items-center justify-center gap-3">
                {scanning ? (
                  <Animated.View style={{ transform: [{ rotate: spin }] }}>
                    <Ionicons name="sync" size={24} color="#00ff88" />
                  </Animated.View>
                ) : (
                  <Ionicons name="search" size={24} color={!hasPermissions ? "#888888" : "#000000"} />
                )}
                <Text className={`text-base font-bold ${
                  scanning || !hasPermissions ? 'text-text-gray' : 'text-black'
                }`}>
                  {scanning ? 'Scanning...' : 'Scan for Devices'}
                </Text>
              </View>
            </TouchableOpacity>

            {/* Scanning Indicator */}
            {scanning && (
              <View className="mt-6 items-center">
                <ActivityIndicator size="large" color="#00ff88" />
                <Text className="text-text-gray mt-3">Searching for devices...</Text>
              </View>
            )}

            {/* Device List */}
            <View className="mt-6">
              {devices.length === 0 && !scanning && (
                <View className="bg-card-black rounded-3xl p-12 items-center border border-gray-800">
                  <View className="bg-secondary-black rounded-full p-6 mb-4">
                    <Ionicons name="bluetooth-outline" size={48} color="#888888" />
                  </View>
                  <Text className="text-white text-lg font-semibold mb-2">
                    No devices found
                  </Text>
                  <Text className="text-text-gray text-center text-sm">
                    Tap "Scan for Devices" to start searching
                  </Text>
                </View>
              )}

              {devices.map(device => (
                <TouchableOpacity
                  key={device.id}
                  className="bg-card-black rounded-2xl p-4 mb-3 border border-gray-800"
                  onPress={() => connectToDevice(device)}
                  activeOpacity={0.7}
                >
                  <View className="flex-row items-center gap-4">
                    <View className="bg-secondary-black rounded-full p-3">
                      <Ionicons name="bluetooth" size={28} color="#00ff88" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-white font-semibold text-base mb-1">
                        {device.name}
                      </Text>
                      <Text className="text-text-gray text-xs font-mono">
                        {device.id}
                      </Text>
                      {device.rssi && (
                        <Text className="text-text-gray text-xs mt-1">
                          Signal: {device.rssi} dBm
                        </Text>
                      )}
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#888888" />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {/* Info Footer */}
        <View className="mt-6 mb-6 bg-secondary-black border border-gray-800 rounded-2xl p-4">
          <View className="items-center">
            <Text className="text-text-light-gray text-sm text-center mb-2">
              💡 Looking for "SmartGlass_Audio"
            </Text>
            <Text className="text-text-gray text-xs text-center">
              Note: Requires native build (npx expo prebuild)
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}