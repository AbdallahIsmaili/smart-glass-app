// services/SocketService.ts
import io, { Socket } from 'socket.io-client';

// 🚨 IMPORTANT: Update this with your PC's IP address
const SERVER_URL = 'http://192.168.1.125:5000';

interface AudioData {
  audio: string;
  text: string;
  objects: Array<{ name: string; confidence: number }>;
  timestamp: string;
}

interface DetectionData {
  text: string;
  objects: Array<{ name: string; confidence: number }>;
  timestamp: string;
}

interface StatusData {
  status: string;
  message: string;
}

interface ServerStatus {
  model_loaded: boolean;
  tts_available: boolean;
  confidence: number;
  connected_clients: number;
}

type EventCallback = (data: any) => void;

class SocketService {
  private socket: Socket | null = null;
  private listeners: Record<string, EventCallback> = {};

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        console.log('🔌 Connecting to server:', SERVER_URL);
        
        this.socket = io(SERVER_URL, {
          transports: ['websocket'],
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          reconnectionAttempts: 5,
        });

        this.socket.on('connect', () => {
          console.log('✅ Connected to server');
          resolve();
        });

        this.socket.on('connect_error', (error) => {
          console.error('❌ Connection error:', error.message);
          reject(error);
        });

        this.socket.on('disconnect', (reason) => {
          console.log('🔌 Disconnected:', reason);
          if (this.listeners.onDisconnect) {
            this.listeners.onDisconnect(reason);
          }
        });

        // Listen for audio data
        this.socket.on('audio_ready', (data: AudioData) => {
          console.log('🔊 Audio received:', data.text);
          if (this.listeners.onAudioReady) {
            this.listeners.onAudioReady(data);
          }
        });

        // Listen for detection data (no audio)
        this.socket.on('detection', (data: DetectionData) => {
          console.log('🎯 Detection:', data.text);
          if (this.listeners.onDetection) {
            this.listeners.onDetection(data);
          }
        });

        // Connection status updates
        this.socket.on('connection_status', (data: StatusData) => {
          console.log('📡 Status:', data.message);
          if (this.listeners.onStatusUpdate) {
            this.listeners.onStatusUpdate(data);
          }
        });

        // Server status
        this.socket.on('server_status', (data: ServerStatus) => {
          console.log('🖥️ Server status:', data);
          if (this.listeners.onServerStatus) {
            this.listeners.onServerStatus(data);
          }
        });

      } catch (error) {
        console.error('❌ Socket connection error:', error);
        reject(error);
      }
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      console.log('🔌 Socket disconnected');
    }
  }

  requestStatus(): void {
    if (this.socket && this.socket.connected) {
      this.socket.emit('request_status');
    }
  }

  updateSettings(settings: { confidence?: number; cooldown?: number }): void {
    if (this.socket && this.socket.connected) {
      this.socket.emit('update_settings', settings);
    }
  }

  on(event: string, callback: EventCallback): void {
    this.listeners[event] = callback;
  }

  off(event: string): void {
    delete this.listeners[event];
  }

  isConnected(): boolean {
    return this.socket !== null && this.socket.connected;
  }
}

export default new SocketService();