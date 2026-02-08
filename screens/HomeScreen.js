import React, { useState, useEffect } from 'react';
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
import MemoryRoad from '../components/MemoryRoad';
import MemoryPopup from '../components/MemoryPopup';

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

// Mock past memories for the road map
const MOCK_MEMORIES = [
  {
    id: 1,
    date: 'February 6, 2026',
    prompt: 'What song brings back the strongest memory?',
    summary:
      'Shared a warm memory about hearing "Moon River" on the radio while driving with their father on Sunday mornings. The song still brings a sense of peace and nostalgia.',
    hasRecording: true,
  },
  {
    id: 2,
    date: 'February 5, 2026',
    prompt: 'Who was your best friend growing up?',
    summary:
      'Talked about childhood friend Eddie who lived next door. They built a treehouse together and stayed friends through high school. Lost touch after college but still thinks of him.',
    hasRecording: true,
  },
  {
    id: 3,
    date: 'February 4, 2026',
    prompt: 'Describe a holiday tradition from your childhood.',
    summary:
      'Recalled making tamales with the whole family every Christmas Eve. Grandmother would lead the kitchen and everyone had a role. The smell of masa still brings comfort.',
    hasRecording: true,
  },
  {
    id: 4,
    date: 'February 3, 2026',
    prompt: 'What was the first job you ever had?',
    summary:
      'First job was at a local bakery at age 15. Loved waking up early to the smell of fresh bread. The owner taught the value of showing up and doing your best.',
    hasRecording: true,
  },
  {
    id: 5,
    date: 'February 2, 2026',
    prompt: 'What did your neighborhood smell like in summer?',
    summary:
      'Summer smelled like fresh-cut grass, barbecue smoke from neighbors, and honeysuckle along the fence. Kids played outside until the streetlights came on.',
    hasRecording: true,
  },
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
  const [selectedMemory, setSelectedMemory] = useState(null);
  const [popupVisible, setPopupVisible] = useState(false);

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
  }, []);

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
          <Text style={styles.logo}>MemoryLane</Text>
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
          memories={MOCK_MEMORIES}
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
    fontSize: 18,
    fontWeight: '400',
    color: '#B0B0B0',
    marginBottom: 4,
  },
  greeting: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1A1A2E',
    textDecorationLine: 'underline',
    textDecorationColor: '#A8C8E8',
    marginBottom: 2,
  },
  date: {
    fontSize: 15,
    color: '#666',
  },
  promptCard: {
    marginHorizontal: 20,
    marginBottom: 24,
    backgroundColor: '#E8EEF8',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#C8D4E4',
    padding: 20,
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
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A2E',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  promptText: {
    fontSize: 20,
    fontWeight: '500',
    color: '#1A1A2E',
    lineHeight: 30,
    marginBottom: 18,
  },
  recordButton: {
    backgroundColor: '#C0E2FE',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignSelf: 'flex-start',
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
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A2E',
  },
});
