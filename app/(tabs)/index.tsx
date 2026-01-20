import { Buffer } from "buffer";
import { Audio } from "expo-av";
import * as FileSystem from 'expo-file-system/legacy';
import React, { useEffect, useRef, useState } from "react";
import {
  PermissionsAndroid,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Alert,
  Animated,
} from "react-native";
import { io, Socket } from "socket.io-client";
import { Ionicons } from "@expo/vector-icons";
import Config from "../../constants/Config";

interface AudioData {
  audio: string;
  description: string;
  objects: string[];
  timestamp: string;
}

export default function HomeScreen() {
  const [wsConnected, setWsConnected] = useState(false);
  const [btConnected, setBtConnected] = useState(false);
  const [btDevice, setBtDevice] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [lastDescription, setLastDescription] = useState<string>("");
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const socketRef = useRef<Socket | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    const setup = async () => {
      await requestPermissions();
      connectToWebSocket();
    };
    setup();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    if (wsConnected || btConnected) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [wsConnected, btConnected]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [`[${timestamp}] ${message}`, ...prev.slice(0, 49)]);
    console.log(message);
  };

  const requestPermissions = async () => {
    if (Platform.OS === "android") {
      try {
        if (Platform.Version >= 31) {
          const result = await PermissionsAndroid.requestMultiple([
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          ]);
          if (
            result["android.permission.BLUETOOTH_SCAN"] ===
              PermissionsAndroid.RESULTS.GRANTED &&
            result["android.permission.BLUETOOTH_CONNECT"] ===
              PermissionsAndroid.RESULTS.GRANTED
          ) {
            addLog("✅ Android 12+ BT Permissions granted");
          } else {
            addLog("❌ Android 12+ BT Permissions denied");
          }
        } else {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          );
          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            addLog("✅ Location Permission granted");
          } else {
            addLog("❌ Location Permission denied");
          }
        }
      } catch (err) {
        addLog(`❌ Permission warning: ${err}`);
      }
    }
  };

  const connectToWebSocket = () => {
    try {
      addLog("🔌 Connecting to server...");

      const socket = io(Config.WS_URL, {
        transports: ["websocket"],
        reconnection: true,
        reconnectionDelay: 5000,
      });

      socket.on("connect", () => {
        setWsConnected(true);
        addLog("✅ Connected to server");
      });

      socket.on("disconnect", () => {
        setWsConnected(false);
        addLog("❌ Disconnected from server");
      });

      socket.on("connection_status", (data: any) => {
        addLog(`📡 ${data.message}`);
      });

      socket.on("audio_data", async (data: AudioData) => {
        addLog(`📷 Detected: ${data.description}`);
        setLastDescription(data.description);
        await handleAudioData(data);
      });

      socketRef.current = socket;
    } catch (error) {
      addLog(`❌ WebSocket error: ${error}`);
    }
  };

  const scanForDevices = async () => {
    Alert.alert(
      "Bluetooth Not Available",
      "Bluetooth scanning requires native build. Run:\n\nnpx expo prebuild\nnpx expo run:android\n\nOr use the Bluetooth tab for mock testing."
    );
    addLog("⚠️ Bluetooth requires native build");
  };

  const handleAudioData = async (data: AudioData) => {
    try {
      const audioBuffer = Buffer.from(data.audio, "base64");
      await playAudioLocally(audioBuffer);

      if (btConnected && btDevice) {
        addLog("📊 Would send audio via Bluetooth (native build required)");
      }
    } catch (error) {
      addLog(`❌ Audio error: ${error}`);
    }
  };

  const playAudioLocally = async (audioBuffer: Buffer) => {
    try {
      const fileUri = `${FileSystem.cacheDirectory}temp_audio.wav`;

      await FileSystem.writeAsStringAsync(
        fileUri,
        audioBuffer.toString("base64"),
        { encoding: FileSystem.EncodingType.Base64 },
      );

      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }

      const { sound } = await Audio.Sound.createAsync({ uri: fileUri });
      soundRef.current = sound;
      await sound.playAsync();

      addLog("📊 Playing audio locally");
    } catch (error) {
      addLog(`❌ Local playback error: ${error}`);
    }
  };

  return (
    <View className="flex-1 bg-primary-black">
      {/* Header with Status */}
      <View className="bg-secondary-black pt-12 pb-6 px-6 border-b border-card-black">
        <Text className="text-3xl font-bold text-white mb-4">Smart Glass</Text>

        {/* Connection Status Cards */}
        <View className="flex-row gap-3">
          <View className="flex-1 bg-card-black rounded-2xl p-4 border border-gray-800">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <Animated.View style={{ transform: [{ scale: wsConnected ? pulseAnim : 1 }] }}>
                  <View className={`w-3 h-3 rounded-full ${wsConnected ? 'bg-light-green' : 'bg-text-gray'}`} />
                </Animated.View>
                <Text className="text-text-light-gray text-sm font-medium">Server</Text>
              </View>
              <Ionicons
                name={wsConnected ? "checkmark-circle" : "close-circle"}
                size={20}
                color={wsConnected ? "#00ff88" : "#888888"}
              />
            </View>
          </View>

          <View className="flex-1 bg-card-black rounded-2xl p-4 border border-gray-800">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <Animated.View style={{ transform: [{ scale: btConnected ? pulseAnim : 1 }] }}>
                  <View className={`w-3 h-3 rounded-full ${btConnected ? 'bg-light-green' : 'bg-text-gray'}`} />
                </Animated.View>
                <Text className="text-text-light-gray text-sm font-medium">Bluetooth</Text>
              </View>
              <Ionicons
                name={btConnected ? "checkmark-circle" : "close-circle"}
                size={20}
                color={btConnected ? "#00ff88" : "#888888"}
              />
            </View>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1 px-6">
        {/* Description Card */}
        {lastDescription ? (
          <View className="mt-6 bg-gradient-to-br from-light-green/20 to-dark-green/10 rounded-3xl p-6 border border-light-green/30">
            <View className="flex-row items-start gap-3">
              <View className="bg-light-green/20 rounded-full p-3">
                <Ionicons name="eye" size={24} color="#00ff88" />
              </View>
              <View className="flex-1">
                <Text className="text-xs font-semibold text-light-green mb-1 uppercase tracking-wider">
                  Latest Detection
                </Text>
                <Text className="text-white text-lg font-medium leading-6">
                  {lastDescription}
                </Text>
              </View>
            </View>
          </View>
        ) : (
          <View className="mt-6 bg-card-black rounded-3xl p-8 border border-gray-800">
            <View className="items-center">
              <View className="bg-secondary-black rounded-full p-4 mb-4">
                <Ionicons name="eye-off-outline" size={32} color="#888888" />
              </View>
              <Text className="text-text-gray text-center">
                Waiting for visual data...
              </Text>
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View className="mt-6 gap-3">
          <TouchableOpacity
            className={`rounded-2xl p-5 ${wsConnected ? 'bg-card-black border border-gray-800' : 'bg-light-green'}`}
            onPress={connectToWebSocket}
            disabled={wsConnected}
            activeOpacity={0.7}
          >
            <View className="flex-row items-center justify-center gap-3">
              <Ionicons
                name={wsConnected ? "checkmark-circle" : "server"}
                size={24}
                color={wsConnected ? "#00ff88" : "#000000"}
              />
              <Text className={`text-base font-bold ${wsConnected ? 'text-light-green' : 'text-black'}`}>
                {wsConnected ? "Connected to Server" : "Connect to Server"}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-card-black border border-gray-800 rounded-2xl p-5"
            onPress={scanForDevices}
            activeOpacity={0.7}
          >
            <View className="flex-row items-center justify-center gap-3">
              <Ionicons name="bluetooth" size={24} color="#00ff88" />
              <Text className="text-base font-bold text-white">
                Scan for Device
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {btConnected && (
          <View className="mt-4 bg-light-green/10 border border-light-green/30 rounded-2xl p-4">
            <View className="flex-row items-center gap-2">
              <Ionicons name="checkmark-circle" size={20} color="#00ff88" />
              <Text className="text-light-green font-medium">
                Connected to: {btDevice}
              </Text>
            </View>
          </View>
        )}

        {/* Info Banner */}
        <View className="mt-4 bg-secondary-black border border-gray-800 rounded-2xl p-4">
          <View className="flex-row items-start gap-3">
            <Ionicons name="information-circle" size={20} color="#888888" />
            <Text className="flex-1 text-text-gray text-sm">
              Full Bluetooth support requires native build. Run npx expo prebuild for complete functionality.
            </Text>
          </View>
        </View>

        {/* Activity Log */}
        <View className="mt-6 mb-6">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-white text-lg font-bold">Activity Log</Text>
            <View className="bg-card-black rounded-full px-3 py-1">
              <Text className="text-text-gray text-xs font-medium">{logs.length} events</Text>
            </View>
          </View>

          <View className="bg-secondary-black rounded-2xl border border-gray-800 overflow-hidden">
            <ScrollView className="max-h-64 p-4">
              {logs.length === 0 ? (
                <View className="py-8 items-center">
                  <Ionicons name="time-outline" size={32} color="#888888" />
                  <Text className="text-text-gray mt-2">No activity yet</Text>
                </View>
              ) : (
                logs.map((log, index) => (
                  <View
                    key={index}
                    className={`mb-2 ${index !== logs.length - 1 ? 'border-b border-card-black pb-2' : ''}`}
                  >
                    <Text className="text-text-light-gray text-xs font-mono leading-5">
                      {log}
                    </Text>
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}