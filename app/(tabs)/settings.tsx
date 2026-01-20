import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
    <View className="flex-1 bg-primary-black">
      {/* Header */}
      <View className="bg-secondary-black pt-12 pb-6 px-6 border-b border-card-black">
        <View className="items-center mb-4">
          <View className="bg-light-green/20 rounded-full p-4 mb-3">
            <Ionicons name="settings" size={40} color="#00ff88" />
          </View>
          <Text className="text-2xl font-bold text-white">Settings</Text>
          <Text className="text-text-gray text-sm mt-1">
            Configure your Smart Glass
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-6">
        {/* Server Configuration */}
        <View className="mt-6">
          <View className="flex-row items-center gap-2 mb-3">
            <Ionicons name="server" size={20} color="#00ff88" />
            <Text className="text-white text-lg font-bold">Server Configuration</Text>
          </View>

          <View className="bg-card-black border border-gray-800 rounded-2xl p-5">
            <Text className="text-text-light-gray text-sm font-semibold mb-2">
              Server URL
            </Text>
            <TextInput
              className="bg-secondary-black border border-gray-700 rounded-xl px-4 py-3 text-white text-base mb-3"
              value={serverUrl}
              onChangeText={setServerUrl}
              placeholder="http://192.168.1.125:5000"
              placeholderTextColor="#666666"
              autoCapitalize="none"
            />
            <View className="bg-secondary-black rounded-xl p-3">
              <View className="flex-row items-start gap-2">
                <Ionicons name="information-circle" size={16} color="#888888" />
                <Text className="flex-1 text-text-gray text-xs leading-5">
                  Find your PC's IP using 'ipconfig' (Windows) or 'ifconfig' (Mac/Linux)
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Bluetooth Configuration */}
        <View className="mt-6">
          <View className="flex-row items-center gap-2 mb-3">
            <Ionicons name="bluetooth" size={20} color="#00ff88" />
            <Text className="text-white text-lg font-bold">Bluetooth Configuration</Text>
          </View>

          <View className="bg-card-black border border-gray-800 rounded-2xl p-5">
            <Text className="text-text-light-gray text-sm font-semibold mb-2">
              Device Name
            </Text>
            <TextInput
              className="bg-secondary-black border border-gray-700 rounded-xl px-4 py-3 text-white text-base mb-3"
              value={deviceName}
              onChangeText={setDeviceName}
              placeholder="SmartGlass_BT"
              placeholderTextColor="#666666"
            />
            <View className="bg-secondary-black rounded-xl p-3">
              <View className="flex-row items-start gap-2">
                <Ionicons name="information-circle" size={16} color="#888888" />
                <Text className="flex-1 text-text-gray text-xs leading-5">
                  This should match the name set in your ESP32 WROOM32
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* System Information */}
        <View className="mt-6">
          <View className="flex-row items-center gap-2 mb-3">
            <Ionicons name="information-circle" size={20} color="#00ff88" />
            <Text className="text-white text-lg font-bold">System Information</Text>
          </View>

          <View className="bg-card-black border border-gray-800 rounded-2xl overflow-hidden">
            <View className="flex-row justify-between p-4 border-b border-gray-800">
              <Text className="text-text-gray">App Version</Text>
              <Text className="text-white font-semibold">1.0.0</Text>
            </View>
            <View className="flex-row justify-between p-4 border-b border-gray-800">
              <Text className="text-text-gray">Current Server</Text>
              <Text className="text-white font-semibold text-right flex-1 ml-4" numberOfLines={1}>
                {Config.SERVER_URL}
              </Text>
            </View>
            <View className="flex-row justify-between p-4">
              <Text className="text-text-gray">BT Device Name</Text>
              <Text className="text-white font-semibold">
                {Config.BLUETOOTH.DEVICE_NAME}
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="mt-6 gap-3">
          <TouchableOpacity
            className="bg-light-green rounded-2xl p-5"
            onPress={handleSave}
            activeOpacity={0.7}
          >
            <View className="flex-row items-center justify-center gap-2">
              <Ionicons name="save" size={20} color="#000000" />
              <Text className="text-black text-center font-bold text-base">
                Save Settings
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-card-black border border-gray-800 rounded-2xl p-5"
            onPress={handleReset}
            activeOpacity={0.7}
          >
            <View className="flex-row items-center justify-center gap-2">
              <Ionicons name="refresh" size={20} color="#ffffff" />
              <Text className="text-white text-center font-bold text-base">
                Reset to Default
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Quick Guide */}
        <View className="mt-6">
          <View className="flex-row items-center gap-2 mb-3">
            <Ionicons name="book" size={20} color="#00ff88" />
            <Text className="text-white text-lg font-bold">Quick Guide</Text>
          </View>

          <View className="bg-card-black border border-gray-800 rounded-2xl p-5">
            <View className="gap-3">
              {[
                'Update Server URL with your PC\'s IP address',
                'Make sure PC and phone are on same WiFi network',
                'Start Python server on PC',
                'Connect to server in main screen',
                'Scan and pair with ESP32 WROOM32',
                'System will automatically stream audio'
              ].map((step, index) => (
                <View key={index} className="flex-row items-start gap-3">
                  <View className="bg-light-green/20 rounded-full w-6 h-6 items-center justify-center mt-0.5">
                    <Text className="text-light-green text-xs font-bold">
                      {index + 1}
                    </Text>
                  </View>
                  <Text className="flex-1 text-text-light-gray text-sm leading-6">
                    {step}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Footer */}
        <View className="mt-6 mb-8 items-center">
          <View className="bg-secondary-black rounded-2xl p-6 border border-gray-800">
            <Text className="text-text-gray text-center text-sm mb-1">
              Smart Glass App v1.0.0
            </Text>
            <Text className="text-text-gray text-center text-xs">
              For Visually Impaired Assistance
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}