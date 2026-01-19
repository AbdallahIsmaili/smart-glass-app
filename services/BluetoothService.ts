// services/BluetoothService.ts
import { BleManager, Device } from 'react-native-ble-plx';
import { PermissionsAndroid, Platform } from 'react-native';

interface DeviceInfo {
  id: string;
  name: string;
  rssi: number;
}

type EventCallback = (data: any) => void;

class BluetoothService {
  private manager: BleManager;
  private connectedDevice: Device | null = null;
  private listeners: Record<string, EventCallback> = {};

  constructor() {
    this.manager = new BleManager();
  }

  async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'android') {
      if (Platform.Version >= 31) {
        // Android 12+
        const permissions = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ]);

        return (
          permissions['android.permission.BLUETOOTH_SCAN'] === 'granted' &&
          permissions['android.permission.BLUETOOTH_CONNECT'] === 'granted' &&
          permissions['android.permission.ACCESS_FINE_LOCATION'] === 'granted'
        );
      } else {
        // Android 11 and below
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
    }
    return true; // iOS handles permissions automatically
  }

  async scanForDevices(timeout: number = 10000): Promise<DeviceInfo[]> {
    console.log('🔍 Scanning for Bluetooth devices...');
    
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) {
      throw new Error('Bluetooth permissions not granted');
    }

    const devices: DeviceInfo[] = [];
    const deviceMap = new Map<string, boolean>();

    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        this.manager.stopDeviceScan();
        console.log(`✅ Scan complete. Found ${devices.length} devices`);
        resolve(devices);
      }, timeout);

      this.manager.startDeviceScan(null, null, (error, device) => {
        if (error) {
          clearTimeout(timeoutId);
          this.manager.stopDeviceScan();
          console.error('❌ Scan error:', error);
          reject(error);
          return;
        }

        if (device && device.name && !deviceMap.has(device.id)) {
          deviceMap.set(device.id, true);
          
          const deviceInfo: DeviceInfo = {
            id: device.id,
            name: device.name,
            rssi: device.rssi || -100,
          };

          devices.push(deviceInfo);
          console.log(`📱 Found: ${device.name} (${device.id})`);

          if (this.listeners.onDeviceFound) {
            this.listeners.onDeviceFound(deviceInfo);
          }
        }
      });
    });
  }

  async connectToDevice(deviceId: string): Promise<Device> {
    try {
      console.log('🔗 Connecting to device:', deviceId);
      
      const device = await this.manager.connectToDevice(deviceId);
      this.connectedDevice = device;
      
      console.log('✅ Connected to:', device.name);
      
      await device.discoverAllServicesAndCharacteristics();
      console.log('📋 Services discovered');

      // Monitor disconnection
      device.onDisconnected((error, disconnectedDevice) => {
        console.log('🔌 Device disconnected');
        this.connectedDevice = null;
        
        if (this.listeners.onDisconnect) {
          this.listeners.onDisconnect();
        }
      });

      if (this.listeners.onConnect) {
        this.listeners.onConnect(device);
      }

      return device;
    } catch (error) {
      console.error('❌ Connection error:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.connectedDevice) {
      try {
        await this.manager.cancelDeviceConnection(this.connectedDevice.id);
        this.connectedDevice = null;
        console.log('✅ Disconnected successfully');
      } catch (error) {
        console.error('❌ Disconnect error:', error);
      }
    }
  }

  async sendAudioData(audioBase64: string): Promise<boolean> {
    if (!this.connectedDevice) {
      throw new Error('No device connected');
    }

    // Note: For actual audio streaming, you'll need to implement
    // the specific Bluetooth profile (A2DP) which requires native modules
    // This is a placeholder for the basic BLE data transfer
    
    try {
      const services = await this.connectedDevice.services();
      console.log('📡 Available services:', services.length);
      
      // You would write to the appropriate characteristic here
      // This requires knowing the ESP32's service and characteristic UUIDs
      
      console.log('📤 Audio data ready to send');
      return true;
    } catch (error) {
      console.error('❌ Send audio error:', error);
      throw error;
    }
  }

  on(event: string, callback: EventCallback): void {
    this.listeners[event] = callback;
  }

  off(event: string): void {
    delete this.listeners[event];
  }

  isConnected(): boolean {
    return this.connectedDevice !== null;
  }

  destroy(): void {
    if (this.manager) {
      this.manager.destroy();
    }
  }
}

export default new BluetoothService();