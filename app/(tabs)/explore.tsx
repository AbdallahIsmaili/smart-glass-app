import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ExploreScreen() {
  return (
    <View className="flex-1 bg-primary-black">
      {/* Header */}
      <View className="bg-secondary-black pt-12 pb-6 px-6 border-b border-card-black">
        <View className="items-center mb-4">
          <View className="bg-light-green/20 rounded-full p-4 mb-3">
            <Ionicons name="compass" size={40} color="#00ff88" />
          </View>
          <Text className="text-2xl font-bold text-white">Explore</Text>
          <Text className="text-text-gray text-sm mt-1">
            Discover app features
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-6">
        <View className="mt-6">
          <View className="bg-card-black border border-gray-800 rounded-2xl p-6 mb-4">
            <View className="flex-row items-center gap-3 mb-3">
              <Ionicons name="code-slash" size={24} color="#00ff88" />
              <Text className="text-white text-lg font-bold">File-based Routing</Text>
            </View>
            <Text className="text-text-light-gray leading-6">
              This app uses Expo Router for navigation. The main screens are located in{' '}
              <Text className="text-light-green">app/(tabs)/</Text> directory.
            </Text>
          </View>

          <View className="bg-card-black border border-gray-800 rounded-2xl p-6 mb-4">
            <View className="flex-row items-center gap-3 mb-3">
              <Ionicons name="phone-portrait" size={24} color="#00ff88" />
              <Text className="text-white text-lg font-bold">Platform Support</Text>
            </View>
            <Text className="text-text-light-gray leading-6">
              This project supports Android, iOS, and web platforms. For full Bluetooth functionality,
              build natively using <Text className="text-light-green">npx expo prebuild</Text>.
            </Text>
          </View>

          <View className="bg-card-black border border-gray-800 rounded-2xl p-6 mb-4">
            <View className="flex-row items-center gap-3 mb-3">
              <Ionicons name="color-palette" size={24} color="#00ff88" />
              <Text className="text-white text-lg font-bold">Modern Styling</Text>
            </View>
            <Text className="text-text-light-gray leading-6">
              The app uses NativeWind (Tailwind CSS for React Native) for modern,
              utility-first styling with a custom dark theme.
            </Text>
          </View>

          <View className="bg-card-black border border-gray-800 rounded-2xl p-6 mb-6">
            <View className="flex-row items-center gap-3 mb-3">
              <Ionicons name="eye" size={24} color="#00ff88" />
              <Text className="text-white text-lg font-bold">Smart Glass Features</Text>
            </View>
            <Text className="text-text-light-gray leading-6 mb-3">
              This app connects to a computer vision server and Bluetooth audio device
              to provide real-time scene descriptions for visually impaired users.
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {['Real-time Vision', 'Audio Streaming', 'Bluetooth Control'].map((feature) => (
                <View key={feature} className="bg-light-green/10 rounded-full px-3 py-1.5">
                  <Text className="text-light-green text-xs font-medium">{feature}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}