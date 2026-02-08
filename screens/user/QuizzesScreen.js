import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    Platform,
    ScrollView,
    Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Bubbles from '../../components/Bubbles';
import { speakText, stopSpeaking } from '../../utils/elevenLabsTTS';

const ERA_QUESTIONS = {
    '1940s': [
        {
            question: 'What board game was a family favorite on rainy days?',
            options: ['Monopoly', 'Checkers', 'Scrabble', 'Chess'],
            type: 'nostalgia',
        },
        {
            question: 'What was a popular treat from the corner store?',
            options: ['Penny candy', 'Ice cream cone', 'Soda pop', 'Popcorn'],
            type: 'nostalgia',
        },
        {
            question: 'What did kids love listening to on the radio?',
            options: ['The Lone Ranger', 'The Shadow', 'Superman', 'All of the above'],
            type: 'nostalgia',
        },
        {
            question: 'What was a common way to cool off in summer?',
            options: ['Swimming hole', 'Fire hydrant', 'Hand fan', 'Porch swing'],
            type: 'nostalgia',
        },
        {
            question: 'What did families often do together in the evening?',
            options: ['Listen to the radio', 'Play cards', 'Tell stories', 'All of these'],
            type: 'nostalgia',
        },
    ],
    '1950s': [
        {
            question: 'What kind of music made kids want to dance?',
            options: ['Rock and Roll', 'Jazz', 'Country', 'Classical'],
            type: 'nostalgia',
        },
        {
            question: 'What was a popular after-school hangout?',
            options: ['The soda fountain', 'The library', 'The park', 'A friend\'s porch'],
            type: 'nostalgia',
        },
        {
            question: 'What was a favorite thing to watch on the new TV?',
            options: ['I Love Lucy', 'Westerns', 'Cartoons', 'The news'],
            type: 'nostalgia',
        },
        {
            question: 'What toy did many kids dream of getting?',
            options: ['A bicycle', 'A baseball glove', 'A doll', 'A train set'],
            type: 'nostalgia',
        },
        {
            question: 'What did the ice cream truck sound like?',
            options: ['A jingle', 'A bell', 'A horn', 'Music box tune'],
            type: 'nostalgia',
        },
    ],
    '1960s': [
        {
            question: 'What kind of music festivals became famous?',
            options: ['Woodstock-style', 'Jazz festivals', 'County fairs', 'Church concerts'],
            type: 'nostalgia',
        },
        {
            question: 'What dance was everyone trying to learn?',
            options: ['The Twist', 'The Mashed Potato', 'The Swim', 'All of these'],
            type: 'nostalgia',
        },
        {
            question: 'What was a popular family weekend activity?',
            options: ['Drive-in movies', 'Picnics', 'Bowling', 'All of these'],
            type: 'nostalgia',
        },
        {
            question: 'What did kids collect and trade at school?',
            options: ['Baseball cards', 'Marbles', 'Comic books', 'Stickers'],
            type: 'nostalgia',
        },
        {
            question: 'What big event did everyone watch together on TV?',
            options: ['The Moon landing', 'The World Series', 'The parade', 'A presidential speech'],
            type: 'nostalgia',
        },
    ],
    '1970s': [
        {
            question: 'What style of music got everyone on the dance floor?',
            options: ['Disco', 'Funk', 'Rock', 'Soul'],
            type: 'nostalgia',
        },
        {
            question: 'What game did families love playing together?',
            options: ['Uno', 'Operation', 'Life', 'All of these'],
            type: 'nostalgia',
        },
        {
            question: 'What was a popular way to record your favorite songs?',
            options: ['Cassette tape', 'Record player', 'Reel-to-reel', '8-track'],
            type: 'nostalgia',
        },
        {
            question: 'What show did kids rush home to watch?',
            options: ['Sesame Street', 'The Brady Bunch', 'Scooby-Doo', 'All of these'],
            type: 'nostalgia',
        },
        {
            question: 'What was a favorite summer activity?',
            options: ['Riding bikes', 'Catching fireflies', 'Playing tag', 'All of these'],
            type: 'nostalgia',
        },
    ],
    default: [
        {
            question: 'What was your favorite thing to do after school?',
            options: ['Play outside', 'Read books', 'Help with chores', 'Visit friends'],
            type: 'nostalgia',
        },
        {
            question: 'What treat did you look forward to most?',
            options: ['Ice cream', 'Fresh pie', 'Candy', 'Homemade cookies'],
            type: 'nostalgia',
        },
        {
            question: 'What was the best part of a family gathering?',
            options: ['The food', 'The stories', 'Playing with cousins', 'All of it'],
            type: 'nostalgia',
        },
        {
            question: 'What sound reminds you of your childhood home?',
            options: ['A screen door', 'Birds singing', 'Radio music', 'Kids laughing'],
            type: 'nostalgia',
        },
        {
            question: 'What game could you play for hours?',
            options: ['Hide and seek', 'Card games', 'Jump rope', 'Tag'],
            type: 'nostalgia',
        },
    ],
};

const AFFIRMATIONS = [
    'Wonderful! You have such a great memory!',
    'That\'s great! Keep it up!',
    'Fantastic! Your mind is sharp!',
    'Love it! What a great answer!',
    'Amazing recall! You\'re doing wonderfully!',
    'Beautiful! Those memories are precious!',
];

const getRandomAffirmation = () => {
    return AFFIRMATIONS[Math.floor(Math.random() * AFFIRMATIONS.length)];
};

const getEraFromBirthday = (birthdayISO) => {
    if (!birthdayISO) return 'default';
    const birthYear = new Date(birthdayISO).getFullYear();
    const youthDecade = Math.floor((birthYear + 10) / 10) * 10;
    const eraKey = `${youthDecade}s`;
    return ERA_QUESTIONS[eraKey] ? eraKey : 'default';
};

const generateMemoryQuestions = (memories) => {
    if (!memories || memories.length === 0) return [];
    const questions = [];

    for (const memory of memories) {
        if (questions.length >= 5) break;

        // Photo-based question
        if (memory.photos && memory.photos.length > 0) {
            questions.push({
                question: 'Who or what is in this photo?',
                options: [
                    memory.label || 'A special memory',
                    'A vacation spot',
                    'A family gathering',
                    'Something from work',
                ],
                type: 'photo_recall',
                photo: memory.photos[0],
            });
            continue;
        }

        // Prompt-based question
        if (memory.prompt && memory.label) {
            questions.push({
                question: `You shared a memory about "${memory.label}" — what was the prompt?`,
                options: [
                    memory.prompt.length > 40 ? memory.prompt.substring(0, 40) + '...' : memory.prompt,
                    'Tell me about your childhood.',
                    'What makes you laugh?',
                    'Describe your favorite season.',
                ],
                type: 'memory_recall',
            });
        }
    }

    return questions;
};

export default function QuizzesScreen() {
    const [view, setView] = useState('categories'); // categories, quiz, result
    const [quizType, setQuizType] = useState(null);
    const [currentQ, setCurrentQ] = useState(0);
    const [showFeedback, setShowFeedback] = useState(false);
    const [affirmation, setAffirmation] = useState('');
    const [questionsAnswered, setQuestionsAnswered] = useState(0);
    const [popQuestions, setPopQuestions] = useState(ERA_QUESTIONS.default);
    const [memoryQuestions, setMemoryQuestions] = useState([]);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const quizStartTime = useRef(Date.now());

    useEffect(() => {
        const loadData = async () => {
            try {
                // Load era-based questions from birthday
                const birthday = await AsyncStorage.getItem('userBirthday');
                const era = getEraFromBirthday(birthday);
                setPopQuestions(ERA_QUESTIONS[era] || ERA_QUESTIONS.default);

                // Load memories for memory quiz
                const memoriesData = await AsyncStorage.getItem('memories');
                const memList = memoriesData ? JSON.parse(memoriesData) : [];
                const generated = generateMemoryQuestions(memList);
                if (generated.length > 0) {
                    setMemoryQuestions(generated);
                }
            } catch (e) {
                console.log('Error loading quiz data:', e);
            }
        };
        loadData();
    }, []);

    const questions = quizType === 'memory'
        ? (memoryQuestions.length > 0 ? memoryQuestions : [
            {
                question: 'Record some memories first, then come back for a personalized quiz!',
                options: ['Got it!', 'OK', 'Sure', 'Will do'],
                type: 'placeholder',
            },
        ])
        : popQuestions;

    const handleSpeakQuestion = async () => {
        if (isSpeaking) {
            await stopSpeaking();
            setIsSpeaking(false);
        } else {
            const q = questions[currentQ];
            const optionsText = q.options.map((o, i) => `Option ${i + 1}: ${o}`).join('. ');
            const fullText = `${q.question} ${optionsText}`;
            setIsSpeaking(true);
            const success = await speakText(fullText, () => {
                setIsSpeaking(false);
            });
            if (!success) setIsSpeaking(false);
        }
    };

    const startQuiz = (type) => {
        stopSpeaking();
        setIsSpeaking(false);
        setQuizType(type);
        setCurrentQ(0);
        setQuestionsAnswered(0);
        quizStartTime.current = Date.now();
        setView('quiz');
    };

    const handleAnswer = () => {
        stopSpeaking();
        setIsSpeaking(false);
        setAffirmation(getRandomAffirmation());
        setShowFeedback(true);
        setQuestionsAnswered((p) => p + 1);

        setTimeout(() => {
            setShowFeedback(false);
            if (currentQ + 1 < questions.length) {
                setCurrentQ((p) => p + 1);
            } else {
                // Log quiz session for memory tracking
                try {
                    const { logQuizSession } = require('../../utils/memoryTracking');
                    const durationSeconds = Math.floor((Date.now() - quizStartTime.current) / 1000);
                    logQuizSession(quizType, questionsAnswered + 1, questions.length, durationSeconds);
                } catch (trackingErr) {
                    // Tracking is non-critical
                }
                setView('result');
            }
        }, 2000);
    };

    const renderCategories = () => (
        <ScrollView contentContainerStyle={styles.categoriesScroll} showsVerticalScrollIndicator={false}>
            <Text style={styles.pageTitle}>Quizzes</Text>
            <Text style={styles.pageSubtitle}>Have fun and keep your mind active!</Text>

            <TouchableOpacity style={styles.categoryCard} onPress={() => startQuiz('memory')} activeOpacity={0.7}>
                <View style={styles.categoryIcon}>
                    <Ionicons name="heart" size={36} color="#5A9DBF" />
                </View>
                <View style={styles.categoryInfo}>
                    <Text style={styles.categoryTitle}>Memory Quiz</Text>
                    <Text style={styles.categoryDesc}>Questions based on your own stories and memories</Text>
                </View>
                <Ionicons name="chevron-forward" size={28} color="#595959" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.categoryCard} onPress={() => startQuiz('pop')} activeOpacity={0.7}>
                <View style={styles.categoryIcon}>
                    <Ionicons name="bulb" size={36} color="#F0C36D" />
                </View>
                <View style={styles.categoryInfo}>
                    <Text style={styles.categoryTitle}>Pop Quiz</Text>
                    <Text style={styles.categoryDesc}>Fun nostalgia questions from music, history, and culture</Text>
                </View>
                <Ionicons name="chevron-forward" size={28} color="#595959" />
            </TouchableOpacity>
        </ScrollView>
    );

    const renderQuiz = () => {
        const q = questions[currentQ];
        return (
            <ScrollView contentContainerStyle={styles.quizScroll} showsVerticalScrollIndicator={false}>
                {/* Progress */}
                <View style={styles.quizHeader}>
                    <TouchableOpacity onPress={() => { stopSpeaking(); setIsSpeaking(false); setView('categories'); }}>
                        <Ionicons name="arrow-back" size={34} color="#1A1A2E" />
                    </TouchableOpacity>
                    <Text style={styles.quizProgress}>
                        {currentQ + 1} of {questions.length}
                    </Text>
                </View>

                <View style={styles.quizProgressBar}>
                    <View style={[styles.quizProgressFill, { width: `${((currentQ + 1) / questions.length) * 100}%` }]} />
                </View>

                {showFeedback ? (
                    <View style={styles.feedbackArea}>
                        <Text style={styles.feedbackEmoji}>🎉</Text>
                        <Text style={styles.feedbackText}>{affirmation}</Text>
                    </View>
                ) : (
                    <>
                        {q.photo && (
                            <Image source={{ uri: q.photo }} style={styles.quizPhoto} />
                        )}
                        <View style={styles.questionRow}>
                            <Text style={styles.questionText}>{q.question}</Text>
                            <TouchableOpacity onPress={handleSpeakQuestion} activeOpacity={0.6} style={styles.volumeButton}>
                                <Ionicons
                                    name={isSpeaking ? 'volume-high' : 'volume-high-outline'}
                                    size={26}
                                    color={isSpeaking ? '#2A6F97' : '#1A1A2E'}
                                />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.optionsArea}>
                            {q.options.map((option, i) => (
                                <TouchableOpacity
                                    key={i}
                                    style={styles.optionBtn}
                                    onPress={handleAnswer}
                                    activeOpacity={0.7}
                                >
                                    <Text style={styles.optionText}>{option}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </>
                )}
            </ScrollView>
        );
    };

    const renderResult = () => (
        <View style={styles.resultArea}>
            <Text style={styles.resultEmoji}>🌟</Text>
            <Text style={styles.resultTitle}>Great job!</Text>
            <Text style={styles.resultMessage}>
                You answered {questionsAnswered} questions. Your memory is wonderful!
            </Text>
            <TouchableOpacity
                style={styles.resultButton}
                onPress={() => setView('categories')}
                activeOpacity={0.7}
            >
                <Text style={styles.resultButtonText}>Try Another Quiz</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <Bubbles maxBubbles={7} />
            <View style={styles.content}>
                <Text style={styles.logo}>Memory Lane</Text>
                {view === 'categories' && renderCategories()}
                {view === 'quiz' && renderQuiz()}
                {view === 'result' && renderResult()}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FAFBFF' },
    content: { flex: 1, paddingHorizontal: 24, paddingTop: 10 },
    logo: { fontSize: 17, fontWeight: '400', color: '#595959', marginBottom: 20 },

    // Categories
    categoriesScroll: { paddingBottom: 40 },
    pageTitle: { fontSize: 35, fontWeight: '700', color: '#1A1A2E', marginBottom: 8 },
    pageSubtitle: { fontSize: 17, color: '#505050', marginBottom: 30 },
    categoryCard: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
        borderRadius: 20, padding: 24, marginBottom: 18, borderWidth: 1.5, borderColor: '#E8EEF2',
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6 },
            android: { elevation: 3 },
        }),
    },
    categoryIcon: {
        width: 70, height: 70, borderRadius: 35, backgroundColor: '#E8F0F8',
        alignItems: 'center', justifyContent: 'center', marginRight: 18,
    },
    categoryInfo: { flex: 1 },
    categoryTitle: { fontSize: 21, fontWeight: '700', color: '#1A1A2E', marginBottom: 6 },
    categoryDesc: { fontSize: 14, color: '#505050', lineHeight: 21 },

    // Quiz
    quizScroll: { paddingBottom: 40 },
    quizHeader: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 16 },
    quizProgress: { fontSize: 15, fontWeight: '600', color: '#505050' },
    quizProgressBar: {
        height: 8, backgroundColor: '#E8E8E8', borderRadius: 4, marginBottom: 30, overflow: 'hidden',
    },
    quizProgressFill: { height: 8, backgroundColor: '#5A9DBF', borderRadius: 4 },
    quizPhoto: {
        width: '100%', height: 220, borderRadius: 18, marginBottom: 24,
    },
    questionRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 30 },
    questionText: { fontSize: 27, fontWeight: '700', color: '#1A1A2E', lineHeight: 38, flex: 1 },
    volumeButton: { paddingTop: 6, padding: 6 },
    optionsArea: { gap: 16 },
    optionBtn: {
        backgroundColor: '#C0E2FE', paddingVertical: 18, paddingHorizontal: 24,
        borderRadius: 20, borderWidth: 1.5, borderColor: '#C0C8D4',
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.12, shadowRadius: 5 },
            android: { elevation: 3 },
        }),
    },
    optionText: { fontSize: 19, fontWeight: '600', color: '#1A1A2E', textAlign: 'center' },

    // Feedback
    feedbackArea: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
    feedbackEmoji: { fontSize: 70, marginBottom: 20 },
    feedbackText: { fontSize: 25, fontWeight: '700', color: '#1A1A2E', textAlign: 'center', lineHeight: 36 },

    // Result
    resultArea: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
    resultEmoji: { fontSize: 80, marginBottom: 20 },
    resultTitle: { fontSize: 37, fontWeight: '700', color: '#1A1A2E', marginBottom: 14 },
    resultMessage: { fontSize: 19, color: '#505050', textAlign: 'center', lineHeight: 30, marginBottom: 34 },
    resultButton: {
        backgroundColor: '#C0E2FE', paddingVertical: 16, paddingHorizontal: 40,
        borderRadius: 30, borderWidth: 1.5, borderColor: '#C0C8D4',
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.15, shadowRadius: 5 },
            android: { elevation: 4 },
        }),
    },
    resultButtonText: { fontSize: 19, fontWeight: '600', color: '#1A1A2E' },
});
