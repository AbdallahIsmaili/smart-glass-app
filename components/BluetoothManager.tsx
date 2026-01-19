// components/BluetoothManager.tsx
import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

// This is a placeholder component that can be expanded
// for more complex Bluetooth management features

interface BluetoothManagerProps {
  isConnected: boolean;
  deviceName?: string;
}

export default function BluetoothManager({ 
  isConnected, 
  deviceName 
}: BluetoothManagerProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.status}>
        {isConnected 
          ? `✅ Connected to ${deviceName || 'device'}` 
          : '⚠️ Not connected'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    marginBottom: 10,
  },
  status: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
  },
});