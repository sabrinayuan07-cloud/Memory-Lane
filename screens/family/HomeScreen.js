import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    SafeAreaView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import MemoryRoad from '../../components/MemoryRoad';
import MemoryPopup from '../../components/MemoryPopup';

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

export default function HomeScreen({ navigation }) {
    const [relationship, setRelationship] = useState('');
    const [memories, setMemories] = useState([]);
    const [selectedMemory, setSelectedMemory] = useState(null);
    const [popupVisible, setPopupVisible] = useState(false);

    useFocusEffect(
        useCallback(() => {
            const loadData = async () => {
                try {
                    const rel = await AsyncStorage.getItem('relationship');
                    if (rel) setRelationship(rel);

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
                        {relationship ? `${relationship}'s Memories` : "Mom's Memories"}
                    </Text>
                    <Text style={styles.date}>{getFormattedDate()}</Text>
                </View>

                {/* Shared Memory Lane Road Map - same as senior, with color-coded circles */}
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
        fontSize: 20,
        fontWeight: '400',
        color: '#595959',
        marginBottom: 4,
    },
    greeting: {
        fontSize: 30,
        fontWeight: '700',
        color: '#1A1A2E',
        marginBottom: 4,
    },
    date: {
        fontSize: 19,
        fontWeight: '700',
        color: '#2A2A3E',
    },
});
