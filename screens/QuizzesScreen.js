import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Bubbles from '../components/Bubbles';

const MEMORY_QUIZ_QUESTIONS = [
  {
    question: 'You mentioned your mom\'s cooking - what was her signature dish?',
    options: ['Chicken Soup', 'Lasagna', 'Apple Pie', 'Meatloaf'],
    type: 'recipe_recall',
  },
  {
    question: 'You talked about a childhood friend - what was his name?',
    options: ['Eddie', 'Frank', 'Billy', 'George'],
    type: 'memory_recall',
  },
  {
    question: 'What holiday tradition did you share about?',
    options: ['Making tamales', 'Decorating the tree', 'Caroling', 'Opening gifts'],
    type: 'memory_recall',
  },
  {
    question: 'Where was your first job?',
    options: ['A bakery', 'A grocery store', 'A gas station', 'A restaurant'],
    type: 'memory_recall',
  },
];

const POP_QUIZ_QUESTIONS = [
  {
    question: 'What year did man first walk on the moon?',
    options: ['1965', '1969', '1972', '1968'],
    type: 'historical',
  },
  {
    question: 'Who sang "What a Wonderful World"?',
    options: ['Louis Armstrong', 'Frank Sinatra', 'Nat King Cole', 'Dean Martin'],
    type: 'music',
  },
  {
    question: 'What decade did color TV become common in homes?',
    options: ['1950s', '1960s', '1970s', '1940s'],
    type: 'historical',
  },
  {
    question: 'Which show featured "Lucy" getting into trouble?',
    options: ['I Love Lucy', 'The Lucy Show', 'Happy Days', 'Leave It to Beaver'],
    type: 'entertainment',
  },
  {
    question: 'What was the popular dance in the 1960s?',
    options: ['The Twist', 'The Waltz', 'The Foxtrot', 'The Jive'],
    type: 'culture',
  },
];

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

export default function QuizzesScreen() {
  const [view, setView] = useState('categories'); // categories, quiz, result
  const [quizType, setQuizType] = useState(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [affirmation, setAffirmation] = useState('');
  const [questionsAnswered, setQuestionsAnswered] = useState(0);

  const questions = quizType === 'memory' ? MEMORY_QUIZ_QUESTIONS : POP_QUIZ_QUESTIONS;

  const startQuiz = (type) => {
    setQuizType(type);
    setCurrentQ(0);
    setQuestionsAnswered(0);
    setView('quiz');
  };

  const handleAnswer = () => {
    setAffirmation(getRandomAffirmation());
    setShowFeedback(true);
    setQuestionsAnswered((p) => p + 1);

    setTimeout(() => {
      setShowFeedback(false);
      if (currentQ + 1 < questions.length) {
        setCurrentQ((p) => p + 1);
      } else {
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
          <Ionicons name="heart" size={32} color="#C5B9E8" />
        </View>
        <View style={styles.categoryInfo}>
          <Text style={styles.categoryTitle}>Memory Quiz</Text>
          <Text style={styles.categoryDesc}>Questions based on your own stories and memories</Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color="#999" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.categoryCard} onPress={() => startQuiz('pop')} activeOpacity={0.7}>
        <View style={styles.categoryIcon}>
          <Ionicons name="bulb" size={32} color="#F0C36D" />
        </View>
        <View style={styles.categoryInfo}>
          <Text style={styles.categoryTitle}>Pop Quiz</Text>
          <Text style={styles.categoryDesc}>Fun nostalgia questions from music, history, and culture</Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color="#999" />
      </TouchableOpacity>
    </ScrollView>
  );

  const renderQuiz = () => {
    const q = questions[currentQ];
    return (
      <ScrollView contentContainerStyle={styles.quizScroll} showsVerticalScrollIndicator={false}>
        {/* Progress */}
        <View style={styles.quizHeader}>
          <TouchableOpacity onPress={() => setView('categories')}>
            <Ionicons name="arrow-back" size={28} color="#1A1A2E" />
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
            <Text style={styles.questionText}>{q.question}</Text>
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
      <Bubbles />
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
  logo: { fontSize: 20, fontWeight: '400', color: '#B0B0B0', marginBottom: 20 },

  // Categories
  categoriesScroll: { paddingBottom: 40 },
  pageTitle: { fontSize: 32, fontWeight: '700', color: '#1A1A2E', marginBottom: 6 },
  pageSubtitle: { fontSize: 18, color: '#666', marginBottom: 30 },
  categoryCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    borderRadius: 16, padding: 20, marginBottom: 16, borderWidth: 1.5, borderColor: '#E8EEF2',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6 },
      android: { elevation: 3 },
    }),
  },
  categoryIcon: {
    width: 60, height: 60, borderRadius: 30, backgroundColor: '#F5F0FF',
    alignItems: 'center', justifyContent: 'center', marginRight: 16,
  },
  categoryInfo: { flex: 1 },
  categoryTitle: { fontSize: 22, fontWeight: '700', color: '#1A1A2E', marginBottom: 4 },
  categoryDesc: { fontSize: 16, color: '#666', lineHeight: 22 },

  // Quiz
  quizScroll: { paddingBottom: 40 },
  quizHeader: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 16 },
  quizProgress: { fontSize: 18, fontWeight: '600', color: '#666' },
  quizProgressBar: {
    height: 6, backgroundColor: '#E8E8E8', borderRadius: 3, marginBottom: 30, overflow: 'hidden',
  },
  quizProgressFill: { height: 6, backgroundColor: '#C5B9E8', borderRadius: 3 },
  questionText: { fontSize: 26, fontWeight: '700', color: '#1A1A2E', lineHeight: 36, marginBottom: 30 },
  optionsArea: { gap: 14 },
  optionBtn: {
    backgroundColor: '#C0E2FE', paddingVertical: 18, paddingHorizontal: 24,
    borderRadius: 16, borderWidth: 1.5, borderColor: '#C0C8D4',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.12, shadowRadius: 5 },
      android: { elevation: 3 },
    }),
  },
  optionText: { fontSize: 20, fontWeight: '600', color: '#1A1A2E', textAlign: 'center' },

  // Feedback
  feedbackArea: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  feedbackEmoji: { fontSize: 60, marginBottom: 16 },
  feedbackText: { fontSize: 24, fontWeight: '700', color: '#1A1A2E', textAlign: 'center', lineHeight: 34 },

  // Result
  resultArea: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  resultEmoji: { fontSize: 70, marginBottom: 16 },
  resultTitle: { fontSize: 34, fontWeight: '700', color: '#1A1A2E', marginBottom: 12 },
  resultMessage: { fontSize: 20, color: '#555', textAlign: 'center', lineHeight: 30, marginBottom: 30 },
  resultButton: {
    backgroundColor: '#C0E2FE', paddingVertical: 16, paddingHorizontal: 40,
    borderRadius: 30, borderWidth: 1.5, borderColor: '#C0C8D4',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.15, shadowRadius: 5 },
      android: { elevation: 4 },
    }),
  },
  resultButtonText: { fontSize: 20, fontWeight: '600', color: '#1A1A2E' },
});
