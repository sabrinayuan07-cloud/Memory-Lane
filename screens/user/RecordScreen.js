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
import Bubbles from '../../components/Bubbles';
import { generateMemorySummary } from '../../utils/geminiSummary';
import { speakText, stopSpeaking } from '../../utils/elevenLabsTTS';

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

const PROMPT_CATEGORIES = {
    'What was your favourite meal your mother made?': { category: 'food', label: "Mom's Cooking" },
    'Tell me about the first time you fell in love.': { category: 'family', label: 'First Love' },
    'What did your neighborhood smell like in summer?': { category: 'nature', label: 'Summer Days' },
    'What was your proudest moment at work?': { category: 'work', label: 'Proudest Moment' },
    'Who was your best friend growing up?': { category: 'friendship', label: 'Childhood Friend' },
    'What was your favorite game to play as a child?': { category: 'childhood', label: 'Childhood Games' },
    'Describe a holiday tradition from your childhood.': { category: 'holiday', label: 'Holiday Tradition' },
    'What was the first job you ever had?': { category: 'work', label: 'First Job' },
    'What song brings back the strongest memory?': { category: 'music', label: 'A Special Song' },
    'Tell me about a place that felt like home.': { category: 'family', label: 'Feeling of Home' },
};

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
    const [isSpeaking, setIsSpeaking] = useState(false);

    const timerRef = useRef(null);
    const recordingRef = useRef(null);
    const soundRef = useRef(null);
    const recordingUriRef = useRef(null);
    const screenOpenTime = useRef(Date.now());

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
        screenOpenTime.current = Date.now();
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            if (soundRef.current) soundRef.current.unloadAsync();
        };
    }, []);

    const beginRecording = async () => {
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

    const startRecording = async () => {
        try {
            const existing = await AsyncStorage.getItem('memories');
            const memories = existing ? JSON.parse(existing) : [];
            const today = new Date().toDateString();
            const todayMemory = memories.find(
                (m) => new Date(m.dateISO || m.date).toDateString() === today
            );
            if (todayMemory) {
                Alert.alert(
                    'Re-record today\'s memory?',
                    'You already recorded a memory today. Recording again will replace it.',
                    [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Record Again', onPress: beginRecording },
                    ]
                );
                return;
            }
        } catch (e) {
            console.log('Error checking today\'s memory:', e);
        }
        beginRecording();
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
            let memories = existing ? JSON.parse(existing) : [];

            // Filter out today's old memory if re-recording
            const today = new Date().toDateString();
            memories = memories.filter(
                (m) => new Date(m.dateISO || m.date).toDateString() !== today
            );

            const prompt = getDailyPrompt();
            const promptInfo = PROMPT_CATEGORIES[prompt] || { category: 'childhood', label: 'A Memory' };
            const now = new Date();

            const newMemory = {
                id: Date.now(),
                dateISO: now.toISOString(),
                date: now.toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                }),
                prompt: prompt,
                category: promptInfo.category,
                label: promptInfo.label,
                summary: `Shared a memory about "${promptInfo.label}" in response to today's prompt.`,
                hasRecording: !!recordingUriRef.current,
                recordingUri: recordingUriRef.current,
                photos: photos,
                duration: elapsedTime,
            };
            memories.unshift(newMemory);
            await AsyncStorage.setItem('memories', JSON.stringify(memories));

            // Generate AI summary from recording (async, non-blocking)
            if (recordingUriRef.current) {
                generateMemorySummary(recordingUriRef.current, prompt)
                    .then(async (aiSummary) => {
                        if (aiSummary) {
                            try {
                                const updated = await AsyncStorage.getItem('memories');
                                const memList = updated ? JSON.parse(updated) : [];
                                const idx = memList.findIndex((m) => m.id === newMemory.id);
                                if (idx !== -1) {
                                    memList[idx].summary = aiSummary;
                                    await AsyncStorage.setItem('memories', JSON.stringify(memList));
                                }
                            } catch (e) {
                                console.log('Error saving AI summary:', e);
                            }
                        }
                    })
                    .catch(() => {});
            }

            // Update streak
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

            // Log recording session for memory tracking
            try {
                const { logRecordingSession, checkForFamilyAlert } = require('../../utils/memoryTracking');
                const responseTime = Math.floor((Date.now() - screenOpenTime.current) / 1000);
                await logRecordingSession(responseTime, elapsedTime, photos.length, prompt);
                const alertMsg = await checkForFamilyAlert();
                if (alertMsg) {
                    await AsyncStorage.setItem('pendingFamilyAlert', alertMsg);
                }
            } catch (trackingErr) {
                // Tracking is non-critical
            }
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

    const handleSpeakPrompt = async () => {
        if (isSpeaking) {
            await stopSpeaking();
            setIsSpeaking(false);
        } else {
            setIsSpeaking(true);
            const success = await speakText(getDailyPrompt(), () => {
                setIsSpeaking(false);
            });
            if (!success) setIsSpeaking(false);
        }
    };

    // --- RENDER SECTIONS ---

    const renderIdle = () => (
        <View style={styles.micArea}>
            <TouchableOpacity style={styles.micButton} onPress={startRecording} activeOpacity={0.7}>
                <Ionicons name="mic-outline" size={60} color="#1A1A2E" />
            </TouchableOpacity>
            <Text style={styles.tapText}>Tap to Record</Text>
        </View>
    );

    const renderRecording = () => (
        <View style={styles.micArea}>
            <Text style={styles.recordingText}>Recording</Text>
            <Text style={styles.timer}>{formatTime(elapsedTime)}</Text>
            <TouchableOpacity style={[styles.micButton, styles.micButtonRecording]} activeOpacity={0.7}>
                <Ionicons name="mic" size={60} color="#D32F2F" />
            </TouchableOpacity>
            <View style={styles.controlsRow}>
                <TouchableOpacity style={styles.controlButton} onPress={pauseRecording}>
                    <Ionicons name="pause" size={36} color="#1A1A2E" />
                    <Text style={styles.controlLabel}>Pause</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.doneButton} onPress={stopRecording}>
                    <Ionicons name="checkmark" size={36} color="#fff" />
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
                <Ionicons name="mic-outline" size={60} color="#1A1A2E" />
            </TouchableOpacity>
            <View style={styles.controlsRow}>
                <TouchableOpacity style={styles.controlButton} onPress={resumeRecording}>
                    <Ionicons name="play" size={36} color="#1A1A2E" />
                    <Text style={styles.controlLabel}>Resume</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.doneButton} onPress={stopRecording}>
                    <Ionicons name="checkmark" size={36} color="#fff" />
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
                    <Ionicons name={isPlaying ? 'stop' : 'play'} size={36} color="#1A1A2E" />
                </TouchableOpacity>
                <Text style={styles.playLabel}>{isPlaying ? 'Playing...' : 'Listen to recording'}</Text>
            </View>

            {/* Add photos */}
            <TouchableOpacity style={styles.addPhotoButton} onPress={pickImage}>
                <Ionicons name="images-outline" size={30} color="#1A1A2E" />
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
                    <Ionicons name="refresh" size={28} color="#1A1A2E" />
                    <Text style={styles.redoBtnText}>Redo</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveBtn} onPress={saveMemory}>
                    <Ionicons name="checkmark-circle" size={28} color="#fff" />
                    <Text style={styles.saveBtnText}>Save Memory</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );

    const renderSaved = () => (
        <View style={styles.micArea}>
            <Ionicons name="checkmark-circle" size={100} color="#4CAF50" />
            <Text style={styles.savedText}>Memory Saved!</Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <Bubbles maxBubbles={7} />

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
                            <View style={styles.promptLabelRow}>
                                <Text style={styles.promptLabel}>Today's Memory Prompt</Text>
                                <TouchableOpacity onPress={handleSpeakPrompt} activeOpacity={0.6} style={styles.volumeButton}>
                                    <Ionicons
                                        name={isSpeaking ? 'volume-high' : 'volume-high-outline'}
                                        size={26}
                                        color={isSpeaking ? '#2A6F97' : '#1A1A2E'}
                                    />
                                </TouchableOpacity>
                            </View>
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
    logo: { fontSize: 17, fontWeight: '400', color: '#595959', marginBottom: 20 },
    greetingBlock: { alignItems: 'center', marginBottom: 24 },
    greeting: { fontSize: 35, fontWeight: '700', color: '#1A1A2E', marginBottom: 6 },
    date: { fontSize: 19, fontWeight: '700', color: '#2A2A3E' },
    promptCard: {
        backgroundColor: '#EDF1F8', borderRadius: 20, padding: 28, marginBottom: 24,
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6 },
            android: { elevation: 3 },
        }),
    },
    promptLabelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
    promptLabel: { fontSize: 19, fontWeight: '600', color: '#4A7A99' },
    volumeButton: { padding: 6 },
    promptText: {
        fontSize: 25, fontWeight: '700', color: '#1A1A2E', lineHeight: 36,
    },
    micArea: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 20 },
    micButton: {
        width: 140, height: 140, borderRadius: 70, backgroundColor: '#C0E2FE',
        alignItems: 'center', justifyContent: 'center',
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 },
            android: { elevation: 6 },
        }),
    },
    micButtonRecording: { backgroundColor: '#FDDEDE' },
    tapText: { fontSize: 21, fontWeight: '600', color: '#1A1A2E', marginTop: 16 },
    recordingText: { fontSize: 23, fontWeight: '700', color: '#D32F2F', marginBottom: 6 },
    pausedText: { fontSize: 23, fontWeight: '700', color: '#595959', marginBottom: 6 },
    timer: { fontSize: 45, fontWeight: '300', color: '#1A1A2E', fontVariant: ['tabular-nums'], marginBottom: 20 },
    controlsRow: { flexDirection: 'row', alignItems: 'center', gap: 36, marginTop: 28 },
    controlButton: {
        alignItems: 'center', backgroundColor: '#C0E2FE', width: 90, height: 90,
        borderRadius: 45, justifyContent: 'center',
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.15, shadowRadius: 5 },
            android: { elevation: 4 },
        }),
    },
    controlLabel: { fontSize: 13, fontWeight: '600', color: '#1A1A2E', marginTop: 2 },
    doneButton: {
        alignItems: 'center', backgroundColor: '#4CAF50', width: 90, height: 90,
        borderRadius: 45, justifyContent: 'center',
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.15, shadowRadius: 5 },
            android: { elevation: 4 },
        }),
    },
    doneLabel: { fontSize: 12, fontWeight: '600', color: '#fff', marginTop: 2 },
    // Review state
    reviewScroll: { paddingBottom: 40, paddingTop: 10 },
    reviewTitle: { fontSize: 31, fontWeight: '700', color: '#1A1A2E', marginBottom: 6 },
    reviewDuration: { fontSize: 17, color: '#505050', marginBottom: 24 },
    playbackRow: {
        flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 24,
        backgroundColor: '#EDF1F8', borderRadius: 16, padding: 20,
    },
    playButton: {
        width: 70, height: 70, borderRadius: 35, backgroundColor: '#C0E2FE',
        alignItems: 'center', justifyContent: 'center',
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.12, shadowRadius: 4 },
            android: { elevation: 3 },
        }),
    },
    playLabel: { fontSize: 17, fontWeight: '600', color: '#1A1A2E' },
    addPhotoButton: {
        flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#C0E2FE',
        paddingVertical: 18, paddingHorizontal: 28, borderRadius: 30, alignSelf: 'flex-start',
        marginBottom: 16, borderWidth: 1.5, borderColor: '#C0C8D4',
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.15, shadowRadius: 5 },
            android: { elevation: 4 },
        }),
    },
    addPhotoText: { fontSize: 17, fontWeight: '600', color: '#1A1A2E' },
    photoStrip: { marginBottom: 24 },
    photoWrapper: { marginRight: 12, position: 'relative' },
    photoThumb: { width: 100, height: 100, borderRadius: 14 },
    photoRemove: {
        position: 'absolute', top: -6, right: -6, backgroundColor: '#D32F2F',
        width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center',
    },
    photoRemoveText: { color: '#fff', fontSize: 16, fontWeight: '700' },
    reviewActions: { flexDirection: 'row', gap: 16, marginTop: 14 },
    redoBtn: {
        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
        paddingVertical: 20, borderRadius: 30, borderWidth: 1.5, borderColor: '#C0C8D4',
        backgroundColor: '#fff',
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
            android: { elevation: 2 },
        }),
    },
    redoBtnText: { fontSize: 17, fontWeight: '600', color: '#1A1A2E' },
    saveBtn: {
        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
        paddingVertical: 20, borderRadius: 30, backgroundColor: '#4CAF50',
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.15, shadowRadius: 5 },
            android: { elevation: 4 },
        }),
    },
    saveBtnText: { fontSize: 17, fontWeight: '600', color: '#fff' },
    savedText: { fontSize: 29, fontWeight: '700', color: '#4CAF50', marginTop: 16 },
});
