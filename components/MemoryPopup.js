import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Platform,
  Image,
  ScrollView,
} from 'react-native';
import { Audio } from 'expo-av';

export default function MemoryPopup({ visible, memory, onClose }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const soundRef = useRef(null);

  if (!memory) return null;

  const handleClose = async () => {
    if (soundRef.current) {
      try {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
      } catch (e) {}
      soundRef.current = null;
    }
    setIsPlaying(false);
    onClose();
  };

  const togglePlayback = async () => {
    if (!memory.recordingUri) return;

    if (isPlaying && soundRef.current) {
      try {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
      } catch (e) {}
      soundRef.current = null;
      setIsPlaying(false);
      return;
    }

    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: memory.recordingUri },
        { shouldPlay: true }
      );
      soundRef.current = sound;
      setIsPlaying(true);
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          setIsPlaying(false);
          soundRef.current = null;
        }
      });
    } catch (err) {
      console.log('Failed to play recording:', err);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={handleClose}
      >
        <View style={styles.popup}>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>

          <Text style={styles.date}>{memory.date}</Text>
          <Text style={styles.prompt}>{memory.prompt}</Text>

          <View style={styles.divider} />

          <Text style={styles.summaryLabel}>AI Summary</Text>
          <Text style={styles.summary}>{memory.summary}</Text>

          {/* Photo strip */}
          {memory.photos && memory.photos.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.photoStrip}
            >
              {memory.photos.map((uri, i) => (
                <Image key={i} source={{ uri }} style={styles.photoThumb} />
              ))}
            </ScrollView>
          )}

          {(memory.hasRecording || memory.recordingUri) && (
            <TouchableOpacity style={styles.playButton} onPress={togglePlayback}>
              <Text style={styles.playButtonText}>
                {isPlaying ? 'Stop Recording' : 'Play Recording'}
              </Text>
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
    color: '#595959',
    fontWeight: '600',
  },
  date: {
    fontSize: 14,
    color: '#595959',
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
    color: '#595959',
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
  photoStrip: {
    marginBottom: 16,
  },
  photoThumb: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 10,
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
