import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Platform,
} from 'react-native';

export default function MemoryPopup({ visible, memory, onClose }) {
  if (!memory) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.popup}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>

          <Text style={styles.date}>{memory.date}</Text>
          <Text style={styles.prompt}>{memory.prompt}</Text>

          <View style={styles.divider} />

          <Text style={styles.summaryLabel}>AI Summary</Text>
          <Text style={styles.summary}>{memory.summary}</Text>

          {memory.hasRecording && (
            <TouchableOpacity style={styles.playButton}>
              <Text style={styles.playButtonText}>Play Recording</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  popup: {
    backgroundColor: '#FAFBFF',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  closeButton: {
    position: 'absolute',
    top: 14,
    right: 18,
    zIndex: 1,
  },
  closeText: {
    fontSize: 20,
    color: '#999',
    fontWeight: '600',
  },
  date: {
    fontSize: 14,
    color: '#888',
    marginBottom: 8,
  },
  prompt: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A2E',
    lineHeight: 26,
    marginBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginBottom: 16,
  },
  summaryLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  summary: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 20,
  },
  playButton: {
    backgroundColor: '#C0E2FE',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignSelf: 'center',
    borderWidth: 1.5,
    borderColor: '#C0C8D4',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  playButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A2E',
  },
});
