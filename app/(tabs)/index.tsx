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
  AppState,
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
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    const setup = async () => {
      await setupAudio();
      await requestPermissions();
      connectToWebSocket();
    };
    setup();

    // Handle app state changes
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        addLog('📱 App returned to foreground');
      }
      appState.current = nextAppState;
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      subscription.remove();
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

  const setupAudio = async () => {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
      addLog('🔊 Audio mode configured');
    } catch (error) {
      addLog(`⚠️ Audio setup warning: ${error}`);
    }
  };

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
      // Check if app is in foreground
      if (appState.current !== 'active') {
        addLog("⚠️ Skipping playback - app in background");
        return;
      }

      const fileUri = `${FileSystem.cacheDirectory}temp_audio.wav`;

      await FileSystem.writeAsStringAsync(
        fileUri,
        audioBuffer.toString("base64"),
        { encoding: FileSystem.EncodingType.Base64 },
      );

      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri: fileUri },
        { shouldPlay: true }
      );

      soundRef.current = sound;

      // Set up completion callback
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
        }
      });

      addLog("🔊 Playing audio locally");
    } catch (error: any) {
      // Handle specific error cases
      if (error.message?.includes('background')) {
        addLog("⚠️ Cannot play - app in background");
      } else if (error.message?.includes('focus')) {
        addLog("⚠️ Cannot play - audio focus not acquired");
      } else {
        addLog(`❌ Local playback error: ${error}`);
      }
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#000000' }}>
      {/* Header with Status */}
      <View style={{
        backgroundColor: '#0a0a0a',
        paddingTop: 48,
        paddingBottom: 24,
        paddingHorizontal: 24,
        borderBottomWidth: 1,
        borderBottomColor: '#1a1a1a'
      }}>
        <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#ffffff', marginBottom: 16 }}>
          Smart Glass
        </Text>

        {/* Connection Status Cards */}
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{
            flex: 1,
            backgroundColor: '#1a1a1a',
            borderRadius: 16,
            padding: 16,
            borderWidth: 1,
            borderColor: '#2a2a2a'
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Animated.View style={{ transform: [{ scale: wsConnected ? pulseAnim : 1 }] }}>
                  <View style={{
                    width: 12,
                    height: 12,
                    borderRadius: 6,
                    backgroundColor: wsConnected ? '#00ff88' : '#888888'
                  }} />
                </Animated.View>
                <Text style={{ color: '#cccccc', fontSize: 14, fontWeight: '500' }}>Server</Text>
              </View>
              <Ionicons
                name={wsConnected ? "checkmark-circle" : "close-circle"}
                size={20}
                color={wsConnected ? "#00ff88" : "#888888"}
              />
            </View>
          </View>

          <View style={{
            flex: 1,
            backgroundColor: '#1a1a1a',
            borderRadius: 16,
            padding: 16,
            borderWidth: 1,
            borderColor: '#2a2a2a'
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Animated.View style={{ transform: [{ scale: btConnected ? pulseAnim : 1 }] }}>
                  <View style={{
                    width: 12,
                    height: 12,
                    borderRadius: 6,
                    backgroundColor: btConnected ? '#00ff88' : '#888888'
                  }} />
                </Animated.View>
                <Text style={{ color: '#cccccc', fontSize: 14, fontWeight: '500' }}>Bluetooth</Text>
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

      <ScrollView style={{ flex: 1, paddingHorizontal: 24 }}>
        {/* Description Card */}
        {lastDescription ? (
          <View style={{
            marginTop: 24,
            backgroundColor: 'rgba(0, 255, 136, 0.1)',
            borderRadius: 24,
            padding: 24,
            borderWidth: 1,
            borderColor: 'rgba(0, 255, 136, 0.3)'
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
              <View style={{
                backgroundColor: 'rgba(0, 255, 136, 0.2)',
                borderRadius: 20,
                padding: 12
              }}>
                <Ionicons name="eye" size={24} color="#00ff88" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{
                  fontSize: 10,
                  fontWeight: '600',
                  color: '#00ff88',
                  marginBottom: 4,
                  letterSpacing: 1.5
                }}>
                  LATEST DETECTION
                </Text>
                <Text style={{
                  color: '#ffffff',
                  fontSize: 18,
                  fontWeight: '500',
                  lineHeight: 24
                }}>
                  {lastDescription}
                </Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={{
            marginTop: 24,
            backgroundColor: '#1a1a1a',
            borderRadius: 24,
            padding: 32,
            borderWidth: 1,
            borderColor: '#2a2a2a',
            alignItems: 'center'
          }}>
            <View style={{
              backgroundColor: '#0a0a0a',
              borderRadius: 20,
              padding: 16,
              marginBottom: 16
            }}>
              <Ionicons name="eye-off-outline" size={32} color="#888888" />
            </View>
            <Text style={{ color: '#888888', textAlign: 'center' }}>
              Waiting for visual data...
            </Text>
          </View>
        )}

        {/* Action Buttons */}
        <View style={{ marginTop: 24, gap: 12 }}>
          <TouchableOpacity
            style={{
              borderRadius: 16,
              padding: 20,
              backgroundColor: wsConnected ? '#1a1a1a' : '#00ff88',
              borderWidth: wsConnected ? 1 : 0,
              borderColor: '#2a2a2a'
            }}
            onPress={connectToWebSocket}
            disabled={wsConnected}
            activeOpacity={0.7}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
              <Ionicons
                name={wsConnected ? "checkmark-circle" : "server"}
                size={24}
                color={wsConnected ? "#00ff88" : "#000000"}
              />
              <Text style={{
                fontSize: 16,
                fontWeight: 'bold',
                color: wsConnected ? '#00ff88' : '#000000'
              }}>
                {wsConnected ? "Connected to Server" : "Connect to Server"}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              backgroundColor: '#1a1a1a',
              borderWidth: 1,
              borderColor: '#2a2a2a',
              borderRadius: 16,
              padding: 20
            }}
            onPress={scanForDevices}
            activeOpacity={0.7}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
              <Ionicons name="bluetooth" size={24} color="#00ff88" />
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#ffffff' }}>
                Scan for Device
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {btConnected && (
          <View style={{
            marginTop: 16,
            backgroundColor: 'rgba(0, 255, 136, 0.1)',
            borderWidth: 1,
            borderColor: 'rgba(0, 255, 136, 0.3)',
            borderRadius: 16,
            padding: 16
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ionicons name="checkmark-circle" size={20} color="#00ff88" />
              <Text style={{ color: '#00ff88', fontWeight: '500' }}>
                Connected to: {btDevice}
              </Text>
            </View>
          </View>
        )}

        {/* Info Banner */}
        <View style={{
          marginTop: 16,
          backgroundColor: '#0a0a0a',
          borderWidth: 1,
          borderColor: '#2a2a2a',
          borderRadius: 16,
          padding: 16
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
            <Ionicons name="information-circle" size={20} color="#888888" />
            <Text style={{ flex: 1, color: '#888888', fontSize: 14 }}>
              Full Bluetooth support requires native build. Run npx expo prebuild for complete functionality.
            </Text>
          </View>
        </View>

        {/* Activity Log */}
        <View style={{ marginTop: 24, marginBottom: 24 }}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 12
          }}>
            <Text style={{ color: '#ffffff', fontSize: 18, fontWeight: 'bold' }}>
              Activity Log
            </Text>
            <View style={{
              backgroundColor: '#1a1a1a',
              borderRadius: 20,
              paddingHorizontal: 12,
              paddingVertical: 4
            }}>
              <Text style={{ color: '#888888', fontSize: 12, fontWeight: '500' }}>
                {logs.length} events
              </Text>
            </View>
          </View>

          <View style={{
            backgroundColor: '#0a0a0a',
            borderRadius: 16,
            borderWidth: 1,
            borderColor: '#2a2a2a',
            overflow: 'hidden'
          }}>
            <ScrollView style={{ maxHeight: 256, padding: 16 }}>
              {logs.length === 0 ? (
                <View style={{ paddingVertical: 32, alignItems: 'center' }}>
                  <Ionicons name="time-outline" size={32} color="#888888" />
                  <Text style={{ color: '#888888', marginTop: 8 }}>No activity yet</Text>
                </View>
              ) : (
                logs.map((log, index) => (
                  <View
                    key={index}
                    style={{
                      marginBottom: 8,
                      borderBottomWidth: index !== logs.length - 1 ? 1 : 0,
                      borderBottomColor: '#1a1a1a',
                      paddingBottom: index !== logs.length - 1 ? 8 : 0
                    }}
                  >
                    <Text style={{
                      color: '#cccccc',
                      fontSize: 12,
                      fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
                      lineHeight: 20
                    }}>
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