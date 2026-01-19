import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import Config from '../../constants/Config';

export default function SettingsScreen() {
  const [serverUrl, setServerUrl] = useState(Config.SERVER_URL);
  const [deviceName, setDeviceName] = useState(Config.BLUETOOTH.DEVICE_NAME);

  const handleSave = () => {
    Alert.alert(
      'Settings Saved',
      'Please restart the app for changes to take effect',
      [{ text: 'OK' }]
    );
  };

  const handleReset = () => {
    setServerUrl(Config.SERVER_URL);
    setDeviceName(Config.BLUETOOTH.DEVICE_NAME);
    Alert.alert('Settings Reset', 'Default settings restored');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔌 Server Configuration</Text>
        
        <Text style={styles.label}>Server URL</Text>
        <TextInput
          style={styles.input}
          value={serverUrl}
          onChangeText={setServerUrl}
          placeholder="http://192.168.1.125:5000"
          autoCapitalize="none"
        />
        
        <Text style={styles.help}>
          💡 Find your PC's IP using 'ipconfig' (Windows) or 'ifconfig' (Mac/Linux)
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📱 Bluetooth Configuration</Text>
        
        <Text style={styles.label}>Device Name</Text>
        <TextInput
          style={styles.input}
          value={deviceName}
          onChangeText={setDeviceName}
          placeholder="SmartGlass_BT"
        />
        
        <Text style={styles.help}>
          💡 This should match the name set in your ESP32 WROOM32
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ℹ️ System Information</Text>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>App Version:</Text>
          <Text style={styles.infoValue}>1.0.0</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Current Server:</Text>
          <Text style={styles.infoValue}>{Config.SERVER_URL}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>BT Device Name:</Text>
          <Text style={styles.infoValue}>{Config.BLUETOOTH.DEVICE_NAME}</Text>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handleSave}>
          <Text style={styles.buttonText}>💾 Save Settings</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.button, styles.buttonSecondary]} onPress={handleReset}>
          <Text style={styles.buttonText}>🔄 Reset to Default</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📖 Quick Guide</Text>
        <Text style={styles.guideText}>
          1. Update Server URL with your PC's IP address{'\n'}
          2. Make sure PC and phone are on same WiFi network{'\n'}
          3. Start Python server on PC{'\n'}
          4. Connect to server in main screen{'\n'}
          5. Scan and pair with ESP32 WROOM32{'\n'}
          6. System will automatically stream audio
        </Text>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Smart Glass App v1.0.0{'\n'}
          For Visually Impaired Assistance
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  section: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
    color: '#333',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#666',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    marginBottom: 8,
  },
  help: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    fontStyle: 'italic',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  buttonContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
  },
  buttonSecondary: {
    backgroundColor: '#6c757d',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  guideText: {
    fontSize: 14,
    lineHeight: 24,
    color: '#666',
  },
  footer: {
    padding: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
});