import { Buffer } from "buffer";
import { Audio } from "expo-av";
import * as FileSystem from 'expo-file-system/legacy';
import React, { useEffect, useRef, useState } from "react";
import {
  PermissionsAndroid,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";
// REMOVED: import BleManager from "react-native-ble-manager";
import { io, Socket } from "socket.io-client";
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
  const [isScanning, setIsScanning] = useState(false);
  const [lastDescription, setLastDescription] = useState<string>("");

  const socketRef = useRef<Socket | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    const setup = async () => {
      await requestPermissions();
      // REMOVED: await initializeBluetooth();
      connectToWebSocket();
    };

    setup();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      // REMOVED: BleManager.stopScan();
    };
  }, []);

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
        addLog("🔊 Would send audio via Bluetooth (native build required)");
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

      addLog("🔊 Playing audio locally");
    } catch (error) {
      addLog(`❌ Local playback error: ${error}`);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.statusBar}>
        <View style={styles.statusItem}>
          <View
            style={[styles.statusDot, wsConnected && styles.statusDotActive]}
          />
          <Text style={styles.statusText}>Server</Text>
        </View>
        <View style={styles.statusItem}>
          <View
            style={[styles.statusDot, btConnected && styles.statusDotActive]}
          />
          <Text style={styles.statusText}>Bluetooth</Text>
        </View>
      </View>

      {lastDescription ? (
        <View style={styles.descriptionBox}>
          <Text style={styles.descriptionText}>{lastDescription}</Text>
        </View>
      ) : null}

      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.button, wsConnected && styles.buttonDisabled]}
          onPress={connectToWebSocket}
          disabled={wsConnected}
        >
          <Text style={styles.buttonText}>
            {wsConnected ? "✅ Connected to Server" : "🔌 Connect to Server"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button]}
          onPress={scanForDevices}
        >
          <Text style={styles.buttonText}>
            📱 Scan for Device
          </Text>
        </TouchableOpacity>

        {btConnected && (
          <View style={styles.connectedDevice}>
            <Text style={styles.connectedText}>
              ✅ Connected to: {btDevice}
            </Text>
          </View>
        )}

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            ℹ️ Full Bluetooth support requires native build
          </Text>
        </View>
      </View>

      <View style={styles.logsContainer}>
        <Text style={styles.logsTitle}>Activity Log</Text>
        <ScrollView style={styles.logsScroll}>
          {logs.map((log, index) => (
            <Text key={index} style={styles.logText}>
              {log}
            </Text>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 16,
  },
  statusBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
  },
  statusItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#ccc",
    marginRight: 8,
  },
  statusDotActive: {
    backgroundColor: "#4CAF50",
  },
  statusText: {
    fontSize: 14,
    fontWeight: "600",
  },
  descriptionBox: {
    backgroundColor: "#007AFF",
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
  },
  descriptionText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  controls: {
    marginBottom: 16,
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
  },
  buttonDisabled: {
    backgroundColor: "#ccc",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  connectedDevice: {
    backgroundColor: "#4CAF50",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  connectedText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
  },
  infoBox: {
    backgroundColor: "#fff3cd",
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#ffc107",
  },
  infoText: {
    color: "#856404",
    fontSize: 12,
    textAlign: "center",
  },
  logsContainer: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    elevation: 2,
  },
  logsTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
  },
  logsScroll: {
    flex: 1,
  },
  logText: {
    fontSize: 12,
    fontFamily: "monospace",
    marginBottom: 4,
    color: "#333",
  },
});