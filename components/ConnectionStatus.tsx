// components/ConnectionStatus.tsx
import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

interface ConnectionStatusProps {
  serverConnected: boolean;
  bluetoothConnected: boolean;
}

export default function ConnectionStatus({ 
  serverConnected, 
  bluetoothConnected 
}: ConnectionStatusProps) {
  const getStatusColor = (connected: boolean) => {
    return connected ? '#00ff00' : '#ff4444';
  };

  return (
    <View style={styles.container}>
      <View style={styles.statusRow}>
        <View style={styles.statusItem}>
          <View 
            style={[
              styles.statusDot, 
              { backgroundColor: getStatusColor(serverConnected) }
            ]} 
          />
          <Text style={styles.statusText}>Server</Text>
        </View>
        <View style={styles.statusItem}>
          <View 
            style={[
              styles.statusDot, 
              { backgroundColor: getStatusColor(bluetoothConnected) }
            ]} 
          />
          <Text style={styles.statusText}>Bluetooth</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 30,
    backgroundColor: '#1a1a1a',
    padding: 15,
    borderRadius: 10,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statusText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});