/**
 * App Configuration
 * Update SERVER_URL with your PC's IP address
 */

export const Config = {
  // Update this with your PC's IP address (find it using ipconfig on Windows)
  SERVER_URL: 'http://192.168.1.131:5000',
  
  // WebSocket URL (same as SERVER_URL)
  WS_URL: 'http://192.168.1.131:5000',
  
  // Bluetooth settings
  BLUETOOTH: {
    // ESP32 WROOM32 device name (update if different)
    DEVICE_NAME: 'SmartGlass_BT',
    
    // Service UUID for audio streaming
    SERVICE_UUID: '4fafc201-1fb5-459e-8fcc-c5c9c331914b',
    CHARACTERISTIC_UUID: 'beb5483e-36e1-4688-b7f5-ea07361b26a8',
    
    // Audio chunk size (bytes)
    CHUNK_SIZE: 512,
  },
  
  // Audio settings
  AUDIO: {
    SAMPLE_RATE: 16000,
    CHANNELS: 1,
    BITS_PER_SAMPLE: 16,
  },
  
  // Connection settings
  CONNECTION: {
    RECONNECT_INTERVAL: 5000, // ms
    PING_INTERVAL: 10000, // ms
  },
};

export default Config;