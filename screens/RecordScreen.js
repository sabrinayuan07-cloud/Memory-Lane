import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  Image,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';
import Bubbles from '../components/Bubbles';

const DAILY_PROMPTS = [
  'What was your favourite meal your mother made?',
  'Tell me about the first time you fell in love.',
  'What did your neighborhood smell like in summer?',
  'What was your proudest moment at work?',
  'Who was your best friend growing up?',
  'What was your favorite game to play as a child?',
  'Describe a holiday tradition from your childhood.',
  'What was the first job you ever had?',
  'What song brings back the strongest memory?',
  'Tell me about a place that felt like home.',
];

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

const getFormattedDate = () => {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const getDailyPrompt = () => {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000
  );
  return DAILY_PROMPTS[dayOfYear % DAILY_PROMPTS.length];
};

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export default function RecordScreen() {
  const [userName, setUserName] = useState('');
  // States: idle, recording, paused, review, saved
  const [screenState, setScreenState] = useState('idle');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [photos, setPhotos] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);

  const timerRef = useRef(null);
  const recordingRef = useRef(null);
  const soundRef = useRef(null);
  const recordingUriRef = useRef(null);

  useEffect(() => {
    const loadName = async () => {
      try {
        const name = await AsyncStorage.getItem('userName');
        if (name) setUserName(name);
      } catch (e) {
        console.log('Error loading name:', e);
      }
    };
    loadName();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (soundRef.current) soundRef.current.unloadAsync();
    };
  }, []);

  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission needed', 'Please allow microphone access.');
        return;
      }
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      recordingRef.current = recording;
      setScreenState('recording');
      setElapsedTime(0);
      timerRef.current = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.log('Failed to start recording:', err);
    }
  };

  const pauseRecording = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    try {
      await recordingRef.current.pauseAsync();
    } catch (err) {
      console.log('Failed to pause:', err);
    }
    setScreenState('paused');
  };

  const resumeRecording = async () => {
    try {
      await recordingRef.current.startAsync();
    } catch (err) {
      console.log('Failed to resume:', err);
    }
    setScreenState('recording');
    timerRef.current = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);
  };

  const stopRecording = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    try {
      await recordingRef.current.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
      const uri = recordingRef.current.getURI();
      recordingUriRef.current = uri;
    } catch (err) {
      console.log('Failed to stop:', err);
    }
    recordingRef.current = null;
    setScreenState('review');
  };

  const playRecording = async () => {
    if (!recordingUriRef.current) return;
    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }
      const { sound } = await Audio.Sound.createAsync(
        { uri: recordingUriRef.current },
        { shouldPlay: true }
      );
      soundRef.current = sound;
      setIsPlaying(true);
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          setIsPlaying(false);
        }
      });
    } catch (err) {
      console.log('Failed to play:', err);
    }
  };

  const stopPlayback = async () => {
    if (soundRef.current) {
      await soundRef.current.stopAsync();
      setIsPlaying(false);
    }
  };

  const redoRecording = () => {
    recordingUriRef.current = null;
    setPhotos([]);
    setElapsedTime(0);
    setScreenState('idle');
  };

  const saveMemory = async () => {
    try {
      const existing = await AsyncStorage.getItem('memories');
      const memories = existing ? JSON.parse(existing) : [];
      const newMemory = {
        id: Date.now(),
        date: new Date().toISOString(),
        prompt: getDailyPrompt(),
        recordingUri: recordingUriRef.current,
        photos: photos,
        duration: elapsedTime,
      };
      memories.unshift(newMemory);
      await AsyncStorage.setItem('memories', JSON.stringify(memories));

      // Update streak
      const today = new Date().toDateString();
      const streakData = await AsyncStorage.getItem('streakData');
      const streak = streakData ? JSON.parse(streakData) : { current: 0, lastDate: '' };
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      if (streak.lastDate === today) {
        // Already recorded today
      } else if (streak.lastDate === yesterday) {
        streak.current += 1;
      } else {
        streak.current = 1;
      }
      streak.lastDate = today;
      await AsyncStorage.setItem('streakData', JSON.stringify(streak));
    } catch (e) {
      console.log('Error saving:', e);
    }
    setScreenState('saved');
    setTimeout(() => {
      recordingUriRef.current = null;
      setPhotos([]);
      setElapsedTime(0);
      setScreenState('idle');
    }, 2000);
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.8,
    });
    if (!result.canceled) {
      const uris = result.assets.map((a) => a.uri);
      setPhotos((prev) => [...prev, ...uris]);
    }
  };

  const removePhoto = (index) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  // --- RENDER SECTIONS ---

  const renderIdle = () => (
    <View style={styles.micArea}>
      <TouchableOpacity style={styles.micButton} onPress={startRecording} activeOpacity={0.7}>
        <Ionicons name="mic-outline" size={48} color="#1A1A2E" />
      </TouchableOpacity>
      <Text style={styles.tapText}>Tap to Record</Text>
    </View>
  );

  const renderRecording = () => (
    <View style={styles.micArea}>
      <Text style={styles.recordingText}>Recording</Text>
      <Text style={styles.timer}>{formatTime(elapsedTime)}</Text>
      <TouchableOpacity style={[styles.micButton, styles.micButtonRecording]} activeOpacity={0.7}>
        <Ionicons name="mic" size={48} color="#D32F2F" />
      </TouchableOpacity>
      <View style={styles.controlsRow}>
        <TouchableOpacity style={styles.controlButton} onPress={pauseRecording}>
          <Ionicons name="pause" size={28} color="#1A1A2E" />
          <Text style={styles.controlLabel}>Pause</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.doneButton} onPress={stopRecording}>
          <Ionicons name="checkmark" size={28} color="#fff" />
          <Text style={styles.doneLabel}>Done</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderPaused = () => (
    <View style={styles.micArea}>
      <Text style={styles.pausedText}>Paused</Text>
      <Text style={styles.timer}>{formatTime(elapsedTime)}</Text>
      <TouchableOpacity style={styles.micButton} activeOpacity={0.7}>
        <Ionicons name="mic-outline" size={48} color="#1A1A2E" />
      </TouchableOpacity>
      <View style={styles.controlsRow}>
        <TouchableOpacity style={styles.controlButton} onPress={resumeRecording}>
          <Ionicons name="play" size={28} color="#1A1A2E" />
          <Text style={styles.controlLabel}>Resume</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.doneButton} onPress={stopRecording}>
          <Ionicons name="checkmark" size={28} color="#fff" />
          <Text style={styles.doneLabel}>Done</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderReview = () => (
    <ScrollView contentContainerStyle={styles.reviewScroll} showsVerticalScrollIndicator={false}>
      <Text style={styles.reviewTitle}>Review Your Memory</Text>
      <Text style={styles.reviewDuration}>Duration: {formatTime(elapsedTime)}</Text>

      {/* Playback */}
      <View style={styles.playbackRow}>
        <TouchableOpacity
          style={styles.playButton}
          onPress={isPlaying ? stopPlayback : playRecording}
        >
          <Ionicons name={isPlaying ? 'stop' : 'play'} size={30} color="#1A1A2E" />
        </TouchableOpacity>
        <Text style={styles.playLabel}>{isPlaying ? 'Playing...' : 'Listen to recording'}</Text>
      </View>

      {/* Add photos */}
      <TouchableOpacity style={styles.addPhotoButton} onPress={pickImage}>
        <Ionicons name="images-outline" size={24} color="#1A1A2E" />
        <Text style={styles.addPhotoText}>Add Photos</Text>
      </TouchableOpacity>

      {photos.length > 0 && (
        <ScrollView horizontal style={styles.photoStrip} showsHorizontalScrollIndicator={false}>
          {photos.map((uri, i) => (
            <View key={i} style={styles.photoWrapper}>
              <Image source={{ uri }} style={styles.photoThumb} />
              <TouchableOpacity style={styles.photoRemove} onPress={() => removePhoto(i)}>
                <Text style={styles.photoRemoveText}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Save / Redo */}
      <View style={styles.reviewActions}>
        <TouchableOpacity style={styles.redoBtn} onPress={redoRecording}>
          <Ionicons name="refresh" size={22} color="#1A1A2E" />
          <Text style={styles.redoBtnText}>Redo</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveBtn} onPress={saveMemory}>
          <Ionicons name="checkmark-circle" size={22} color="#fff" />
          <Text style={styles.saveBtnText}>Save Memory</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderSaved = () => (
    <View style={styles.micArea}>
      <Ionicons name="checkmark-circle" size={80} color="#4CAF50" />
      <Text style={styles.savedText}>Memory Saved!</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Bubbles />

      <View style={styles.content}>
        <Text style={styles.logo}>Memory Lane</Text>

        {screenState !== 'review' && (
          <>
            <View style={styles.greetingBlock}>
              <Text style={styles.greeting}>
                {getGreeting()}, {userName || 'Friend'}
              </Text>
              <Text style={styles.date}>{getFormattedDate()}</Text>
            </View>

            <View style={styles.promptCard}>
              <Text style={styles.promptLabel}>Today's Memory Prompt</Text>
              <Text style={styles.promptText}>"{getDailyPrompt()}"</Text>
            </View>
          </>
        )}

        {screenState === 'idle' && renderIdle()}
        {screenState === 'recording' && renderRecording()}
        {screenState === 'paused' && renderPaused()}
        {screenState === 'review' && renderReview()}
        {screenState === 'saved' && renderSaved()}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFBFF' },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 10 },
  logo: { fontSize: 20, fontWeight: '400', color: '#B0B0B0', marginBottom: 20 },
  greetingBlock: { alignItems: 'center', marginBottom: 24 },
  greeting: { fontSize: 30, fontWeight: '700', color: '#1A1A2E', marginBottom: 4 },
  date: { fontSize: 19, fontWeight: '700', color: '#2A2A3E' },
  promptCard: {
    backgroundColor: '#EDF1F8', borderRadius: 16, padding: 24, marginBottom: 20,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6 },
      android: { elevation: 3 },
    }),
  },
  promptLabel: { fontSize: 20, fontWeight: '600', color: '#8EAAC8', marginBottom: 14 },
  promptText: {
    fontSize: 24, fontWeight: '700', color: '#1A1A2E', lineHeight: 34,
    textDecorationLine: 'underline', textDecorationColor: '#A8C8E8',
  },
  micArea: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 20 },
  micButton: {
    width: 110, height: 110, borderRadius: 55, backgroundColor: '#C0E2FE',
    alignItems: 'center', justifyContent: 'center',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 },
      android: { elevation: 6 },
    }),
  },
  micButtonRecording: { backgroundColor: '#FDDEDE' },
  tapText: { fontSize: 20, fontWeight: '600', color: '#1A1A2E', marginTop: 16 },
  recordingText: { fontSize: 22, fontWeight: '700', color: '#D32F2F', marginBottom: 6 },
  pausedText: { fontSize: 22, fontWeight: '700', color: '#888', marginBottom: 6 },
  timer: { fontSize: 38, fontWeight: '300', color: '#1A1A2E', fontVariant: ['tabular-nums'], marginBottom: 20 },
  controlsRow: { flexDirection: 'row', alignItems: 'center', gap: 30, marginTop: 24 },
  controlButton: {
    alignItems: 'center', backgroundColor: '#C0E2FE', width: 70, height: 70,
    borderRadius: 35, justifyContent: 'center',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.15, shadowRadius: 5 },
      android: { elevation: 4 },
    }),
  },
  controlLabel: { fontSize: 12, fontWeight: '600', color: '#1A1A2E', marginTop: 2 },
  doneButton: {
    alignItems: 'center', backgroundColor: '#4CAF50', width: 70, height: 70,
    borderRadius: 35, justifyContent: 'center',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.15, shadowRadius: 5 },
      android: { elevation: 4 },
    }),
  },
  doneLabel: { fontSize: 12, fontWeight: '600', color: '#fff', marginTop: 2 },
  // Review state
  reviewScroll: { paddingBottom: 40, paddingTop: 10 },
  reviewTitle: { fontSize: 28, fontWeight: '700', color: '#1A1A2E', marginBottom: 6 },
  reviewDuration: { fontSize: 18, color: '#666', marginBottom: 24 },
  playbackRow: {
    flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 24,
    backgroundColor: '#EDF1F8', borderRadius: 14, padding: 16,
  },
  playButton: {
    width: 56, height: 56, borderRadius: 28, backgroundColor: '#C0E2FE',
    alignItems: 'center', justifyContent: 'center',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.12, shadowRadius: 4 },
      android: { elevation: 3 },
    }),
  },
  playLabel: { fontSize: 18, fontWeight: '600', color: '#1A1A2E' },
  addPhotoButton: {
    flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#C0E2FE',
    paddingVertical: 14, paddingHorizontal: 24, borderRadius: 25, alignSelf: 'flex-start',
    marginBottom: 16, borderWidth: 1.5, borderColor: '#C0C8D4',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.15, shadowRadius: 5 },
      android: { elevation: 4 },
    }),
  },
  addPhotoText: { fontSize: 18, fontWeight: '600', color: '#1A1A2E' },
  photoStrip: { marginBottom: 24 },
  photoWrapper: { marginRight: 12, position: 'relative' },
  photoThumb: { width: 90, height: 90, borderRadius: 12 },
  photoRemove: {
    position: 'absolute', top: -6, right: -6, backgroundColor: '#D32F2F',
    width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center',
  },
  photoRemoveText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  reviewActions: { flexDirection: 'row', gap: 16, marginTop: 10 },
  redoBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 16, borderRadius: 30, borderWidth: 1.5, borderColor: '#C0C8D4',
    backgroundColor: '#fff',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
      android: { elevation: 2 },
    }),
  },
  redoBtnText: { fontSize: 18, fontWeight: '600', color: '#1A1A2E' },
  saveBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 16, borderRadius: 30, backgroundColor: '#4CAF50',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.15, shadowRadius: 5 },
      android: { elevation: 4 },
    }),
  },
  saveBtnText: { fontSize: 18, fontWeight: '600', color: '#fff' },
  savedText: { fontSize: 26, fontWeight: '700', color: '#4CAF50', marginTop: 16 },
});
