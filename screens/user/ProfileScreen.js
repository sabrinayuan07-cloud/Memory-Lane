import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    Platform,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import Bubbles from '../../components/Bubbles';
import MemoryPopup from '../../components/MemoryPopup';

export default function ProfileScreen() {
    const [userName, setUserName] = useState('');
    const [memoriesCount, setMemoriesCount] = useState(0);
    const [streak, setStreak] = useState(0);
    const [memories, setMemories] = useState([]);
    const [selectedMemory, setSelectedMemory] = useState(null);
    const [popupVisible, setPopupVisible] = useState(false);

    useFocusEffect(
        useCallback(() => {
            const loadData = async () => {
                try {
                    const name = await AsyncStorage.getItem('userName');
                    if (name) setUserName(name);

                    const memoriesData = await AsyncStorage.getItem('memories');
                    const memList = memoriesData ? JSON.parse(memoriesData) : [];
                    setMemories(memList);
                    setMemoriesCount(memList.length);

                    const streakData = await AsyncStorage.getItem('streakData');
                    if (streakData) {
                        const parsed = JSON.parse(streakData);
                        setStreak(parsed.current || 0);
                    }
                } catch (e) {
                    console.log('Error loading profile:', e);
                }
            };
            loadData();
        }, [])
    );

    const formatDate = (isoString) => {
        return new Date(isoString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const formatDuration = (seconds) => {
        if (!seconds) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleMemoryPress = (memory) => {
        setSelectedMemory(memory);
        setPopupVisible(true);
    };

    return (
        <SafeAreaView style={styles.container}>
            <Bubbles maxBubbles={7} />
            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                <Text style={styles.logo}>Memory Lane</Text>

                {/* Avatar + Name */}
                <View style={styles.avatarSection}>
                    <View style={styles.avatar}>
                        <Ionicons name="person" size={52} color="#5A9DBF" />
                    </View>
                    <Text style={styles.userName}>{userName || 'Friend'}</Text>
                </View>

                {/* Stats row */}
                <View style={styles.statsRow}>
                    <View style={styles.statCard}>
                        <Ionicons name="mic" size={34} color="#C0E2FE" />
                        <Text style={styles.statNumber}>{memoriesCount}</Text>
                        <Text style={styles.statLabel}>Memories</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Ionicons name="flame" size={34} color="#F0A050" />
                        <Text style={styles.statNumber}>{streak}</Text>
                        <Text style={styles.statLabel}>Day Streak</Text>
                    </View>
                </View>

                {/* Memory history */}
                <Text style={styles.sectionTitle}>Your Memory History</Text>

                {memories.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="book-outline" size={56} color="#767676" />
                        <Text style={styles.emptyText}>No memories recorded yet.</Text>
                        <Text style={styles.emptySubtext}>Head to the Record tab to share your first story!</Text>
                    </View>
                ) : (
                    memories.map((memory, index) => (
                        <TouchableOpacity
                            key={memory.id || index}
                            style={styles.historyCard}
                            onPress={() => handleMemoryPress(memory)}
                            activeOpacity={0.7}
                        >
                            <View style={styles.historyLeft}>
                                <Text style={styles.historyDate}>{formatDate(memory.dateISO || memory.date)}</Text>
                                <Text style={styles.historyPrompt} numberOfLines={2}>
                                    {memory.prompt}
                                </Text>
                                <View style={styles.historyMeta}>
                                    <Ionicons name="time-outline" size={18} color="#595959" />
                                    <Text style={styles.historyDuration}>{formatDuration(memory.duration)}</Text>
                                    {memory.photos && memory.photos.length > 0 && (
                                        <>
                                            <Ionicons name="image-outline" size={18} color="#595959" style={{ marginLeft: 12 }} />
                                            <Text style={styles.historyDuration}>{memory.photos.length} photos</Text>
                                        </>
                                    )}
                                </View>
                            </View>
                            <Ionicons name="chevron-forward" size={24} color="#767676" />
                        </TouchableOpacity>
                    ))
                )}
            </ScrollView>

            <MemoryPopup
                visible={popupVisible}
                memory={selectedMemory}
                onClose={() => setPopupVisible(false)}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FAFBFF' },
    scroll: { paddingHorizontal: 24, paddingTop: 10, paddingBottom: 40 },
    logo: { fontSize: 17, fontWeight: '400', color: '#595959', marginBottom: 24 },

    // Avatar
    avatarSection: { alignItems: 'center', marginBottom: 28 },
    avatar: {
        width: 100, height: 100, borderRadius: 50, backgroundColor: '#E8F0F8',
        alignItems: 'center', justifyContent: 'center', marginBottom: 14,
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 6 },
            android: { elevation: 3 },
        }),
    },
    userName: { fontSize: 29, fontWeight: '700', color: '#1A1A2E' },

    // Stats
    statsRow: { flexDirection: 'row', gap: 16, marginBottom: 30 },
    statCard: {
        flex: 1, backgroundColor: '#fff', borderRadius: 20, padding: 24,
        alignItems: 'center', borderWidth: 1.5, borderColor: '#E8EEF2',
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6 },
            android: { elevation: 2 },
        }),
    },
    statNumber: { fontSize: 33, fontWeight: '700', color: '#1A1A2E', marginTop: 8 },
    statLabel: { fontSize: 14, fontWeight: '500', color: '#505050', marginTop: 4 },

    // History
    sectionTitle: { fontSize: 25, fontWeight: '700', color: '#1A1A2E', marginBottom: 18 },
    emptyState: { alignItems: 'center', paddingVertical: 40 },
    emptyText: { fontSize: 19, fontWeight: '600', color: '#595959', marginTop: 14 },
    emptySubtext: { fontSize: 14, color: '#595959', marginTop: 8, textAlign: 'center' },

    historyCard: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
        borderRadius: 18, padding: 22, marginBottom: 14, borderWidth: 1.5, borderColor: '#E8EEF2',
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4 },
            android: { elevation: 1 },
        }),
    },
    historyLeft: { flex: 1 },
    historyDate: { fontSize: 13, fontWeight: '700', color: '#4A7A99', marginBottom: 6 },
    historyPrompt: { fontSize: 17, fontWeight: '600', color: '#1A1A2E', lineHeight: 24, marginBottom: 8 },
    historyMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    historyDuration: { fontSize: 13, color: '#595959' },
});
