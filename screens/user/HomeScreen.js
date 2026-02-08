import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
    Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import MemoryRoad from '../../components/MemoryRoad';
import MemoryPopup from '../../components/MemoryPopup';

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

export default function HomeScreen({ navigation }) {
    const [userName, setUserName] = useState('');
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
                } catch (e) {
                    console.log('Error loading data:', e);
                }
            };
            loadData();
        }, [])
    );

    const handleCirclePress = (memory) => {
        setSelectedMemory(memory);
        setPopupVisible(true);
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.logo}>Memory Lane</Text>
                    <Text style={styles.greeting}>
                        {getGreeting()}, {userName || 'Friend'}
                    </Text>
                    <Text style={styles.date}>{getFormattedDate()}</Text>
                </View>

                {/* Today's Memory Prompt */}
                <View style={styles.promptCard}>
                    <Text style={styles.promptLabel}>TODAY'S MEMORY PROMPT</Text>
                    <Text style={styles.promptText}>"{getDailyPrompt()}"</Text>
                    <TouchableOpacity
                        style={styles.recordButton}
                        onPress={() => navigation.navigate('Record')}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.recordButtonText}>Tap to Record</Text>
                    </TouchableOpacity>
                </View>

                {/* Memory Lane Road Map */}
                <MemoryRoad
                    memories={memories}
                    onCirclePress={handleCirclePress}
                />
            </ScrollView>

            {/* Memory Popup */}
            <MemoryPopup
                visible={popupVisible}
                memory={selectedMemory}
                onClose={() => setPopupVisible(false)}
            />
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
        paddingBottom: 30,
    },
    header: {
        paddingHorizontal: 24,
        paddingTop: 10,
        marginBottom: 16,
    },
    logo: {
        fontSize: 17,
        fontWeight: '400',
        color: '#595959',
        marginBottom: 4,
    },
    greeting: {
        fontSize: 35,
        fontWeight: '700',
        color: '#1A1A2E',
        marginBottom: 6,
    },
    date: {
        fontSize: 19,
        fontWeight: '700',
        color: '#2A2A3E',
    },
    promptCard: {
        marginHorizontal: 20,
        marginBottom: 24,
        backgroundColor: '#E8EEF8',
        borderRadius: 20,
        borderWidth: 1.5,
        borderColor: '#C8D4E4',
        padding: 28,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 6,
            },
            android: {
                elevation: 3,
            },
        }),
    },
    promptLabel: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1A1A2E',
        letterSpacing: 0.5,
        marginBottom: 14,
    },
    promptText: {
        fontSize: 23,
        fontWeight: '500',
        color: '#1A1A2E',
        lineHeight: 34,
        marginBottom: 20,
    },
    recordButton: {
        backgroundColor: '#C0E2FE',
        paddingVertical: 20,
        paddingHorizontal: 40,
        borderRadius: 30,
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: '#C0C8D4',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.15,
                shadowRadius: 5,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    recordButtonText: {
        fontSize: 17,
        fontWeight: '700',
        color: '#1A1A2E',
    },
});
