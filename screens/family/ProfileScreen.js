import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import Bubbles from '../../components/Bubbles';

export default function ProfileScreen() {
    const [lovedOneName, setLovedOneName] = useState('');
    const [memoriesCount, setMemoriesCount] = useState(0);
    const [quizzesCompleted, setQuizzesCompleted] = useState(0);

    useFocusEffect(
        useCallback(() => {
            const loadData = async () => {
                try {
                    const name = await AsyncStorage.getItem('lovedOneName');
                    if (name) setLovedOneName(name);

                    const memoriesData = await AsyncStorage.getItem('memories');
                    const memList = memoriesData ? JSON.parse(memoriesData) : [];
                    
                    // Count memories from the last 7 days
                    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
                    const recentMemories = memList.filter(m => 
                        new Date(m.dateISO || m.date).getTime() > sevenDaysAgo
                    );
                    setMemoriesCount(recentMemories.length);

                    // Mock quiz data - would come from tracking
                    setQuizzesCompleted(5);
                } catch (e) {
                    console.log('Error loading data:', e);
                }
            };
            loadData();
        }, [])
    );

    return (
        <SafeAreaView style={styles.container}>
            <Bubbles maxBubbles={5} />
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                <Text style={styles.logo}>Memory Lane</Text>
                <Text style={styles.title}>{lovedOneName}'s Progress</Text>
                <Text style={styles.subtitle}>
                    Track cognitive health and memory activities
                </Text>

                {/* Weekly Summary */}
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryTitle}>This Week's Summary</Text>
                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>{memoriesCount}/7</Text>
                            <Text style={styles.statLabel}>Prompts Completed</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>{quizzesCompleted}/7</Text>
                            <Text style={styles.statLabel}>Quizzes Passed</Text>
                        </View>
                    </View>
                </View>

                {/* Recent Activity */}
                <Text style={styles.sectionHeader}>Recent Activity</Text>

                <View style={styles.updateCard}>
                    <View style={styles.updateHeader}>
                        <Text style={styles.updateDate}>Today, 9:30 AM</Text>
                        <View style={[styles.statusBadge, styles.statusWarning]}>
                            <View style={styles.statusDot} />
                            <Text style={styles.statusText}>Concerning</Text>
                        </View>
                    </View>
                    <Text style={styles.updateTitle}>Daily Memory Prompt</Text>
                    <Text style={styles.updateDescription}>
                        {lovedOneName} had difficulty recalling details about favorite meal. Seemed confused about which mother the question referred to and couldn't remember specific dishes. This is a decline from last week's performance.
                    </Text>
                </View>

                <View style={styles.updateCard}>
                    <View style={styles.updateHeader}>
                        <Text style={styles.updateDate}>Yesterday, 2:15 PM</Text>
                        <View style={[styles.statusBadge, styles.statusSuccess]}>
                            <View style={styles.statusDot} />
                            <Text style={styles.statusText}>Completed</Text>
                        </View>
                    </View>
                    <Text style={styles.updateTitle}>Memory Quiz</Text>
                    <Text style={styles.updateDescription}>
                        {lovedOneName} completed the weekly quiz with 85% accuracy. Remembered family names and dates well.
                    </Text>
                </View>

                <View style={styles.updateCard}>
                    <View style={styles.updateHeader}>
                        <Text style={styles.updateDate}>Yesterday, 10:00 AM</Text>
                        <View style={[styles.statusBadge, styles.statusConcern]}>
                            <View style={styles.statusDot} />
                            <Text style={styles.statusText}>Needs Support</Text>
                        </View>
                    </View>
                    <Text style={styles.updateTitle}>Daily Memory Prompt</Text>
                    <Text style={styles.updateDescription}>
                        {lovedOneName} needed a few prompts to recall first day of school. Consider reviewing old school photos together.
                    </Text>
                </View>

                <View style={styles.updateCard}>
                    <View style={styles.updateHeader}>
                        <Text style={styles.updateDate}>Feb 5, 3:45 PM</Text>
                        <View style={[styles.statusBadge, styles.statusSuccess]}>
                            <View style={styles.statusDot} />
                            <Text style={styles.statusText}>Completed</Text>
                        </View>
                    </View>
                    <Text style={styles.updateTitle}>Daily Memory Prompt</Text>
                    <Text style={styles.updateDescription}>
                        {lovedOneName} shared wonderful details about wedding day. Was animated and remembered many specific moments.
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FAFBFF',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingTop: 10,
        paddingBottom: 30,
    },
    logo: {
        fontSize: 20,
        fontWeight: '400',
        color: '#595959',
        marginBottom: 20,
    },
    title: {
        fontSize: 30,
        fontWeight: '700',
        color: '#1A1A2E',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        marginBottom: 30,
    },
    summaryCard: {
        backgroundColor: 'rgba(168, 197, 169, 0.15)',
        borderRadius: 20,
        padding: 24,
        marginBottom: 30,
    },
    summaryTitle: {
        fontSize: 14,
        color: '#5A7A5C',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 20,
    },
    statsRow: {
        flexDirection: 'row',
        gap: 20,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statNumber: {
        fontSize: 32,
        fontWeight: '600',
        color: '#1A1A2E',
        marginBottom: 8,
    },
    statLabel: {
        fontSize: 13,
        color: '#666',
        textAlign: 'center',
    },
    sectionHeader: {
        fontSize: 14,
        color: '#5A7A5C',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 16,
    },
    updateCard: {
        backgroundColor: '#fff',
        borderWidth: 2,
        borderColor: '#F0F4F0',
        borderRadius: 15,
        padding: 18,
        marginBottom: 16,
    },
    updateHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    updateDate: {
        fontSize: 13,
        color: '#999',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusSuccess: {
        backgroundColor: 'rgba(90, 122, 92, 0.1)',
    },
    statusConcern: {
        backgroundColor: 'rgba(232, 180, 77, 0.1)',
    },
    statusWarning: {
        backgroundColor: 'rgba(217, 117, 109, 0.1)',
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#5A7A5C',
    },
    statusText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#5A7A5C',
    },
    updateTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1A1A2E',
        marginBottom: 8,
    },
    updateDescription: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
});