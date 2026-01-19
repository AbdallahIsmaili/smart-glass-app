// components/LogViewer.tsx
import React from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';

interface Log {
  id: number;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
}

interface LogViewerProps {
  logs: Log[];
}

export default function LogViewer({ logs }: LogViewerProps) {
  const getLogColor = (type: Log['type']) => {
    switch (type) {
      case 'success':
        return '#00ff00';
      case 'warning':
        return '#ffaa00';
      case 'error':
        return '#ff4444';
      default:
        return '#00aaff';
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Activity Log</Text>
      <ScrollView style={styles.logsList}>
        {logs.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No activity yet</Text>
          </View>
        ) : (
          logs.map(log => (
            <View key={log.id} style={styles.logItem}>
              <Text style={[styles.logText, { color: getLogColor(log.type) }]}>
                [{log.timestamp}] {log.message}
              </Text>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 10,
  },
  title: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  logsList: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    borderRadius: 8,
    padding: 10,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: '#666',
    fontSize: 14,
  },
  logItem: {
    marginBottom: 8,
  },
  logText: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
});