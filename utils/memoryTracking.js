import AsyncStorage from '@react-native-async-storage/async-storage';

const TRACKING_KEY = 'memoryTrackingData';

const getTrackingData = async () => {
  try {
    const data = await AsyncStorage.getItem(TRACKING_KEY);
    return data ? JSON.parse(data) : { recordings: [], quizzes: [] };
  } catch (e) {
    return { recordings: [], quizzes: [] };
  }
};

const saveTrackingData = async (data) => {
  try {
    await AsyncStorage.setItem(TRACKING_KEY, JSON.stringify(data));
  } catch (e) {
    console.log('Error saving tracking data:', e);
  }
};

export const logRecordingSession = async (responseTime, duration, photoCount, prompt) => {
  const data = await getTrackingData();
  data.recordings.push({
    timestamp: new Date().toISOString(),
    responseTime,
    duration,
    photoCount,
    prompt,
  });
  await saveTrackingData(data);
};

export const logQuizSession = async (quizType, questionsAnswered, totalQuestions, durationSeconds) => {
  const data = await getTrackingData();
  data.quizzes.push({
    timestamp: new Date().toISOString(),
    quizType,
    questionsAnswered,
    totalQuestions,
    durationSeconds,
  });
  await saveTrackingData(data);
};

export const analyzeTrackingData = async () => {
  const data = await getTrackingData();
  const now = Date.now();
  const ninetyDaysAgo = now - 90 * 24 * 60 * 60 * 1000;
  const fortyFiveDaysAgo = now - 45 * 24 * 60 * 60 * 1000;

  // Filter to 90-day window
  const recentRecordings = data.recordings.filter(
    (r) => new Date(r.timestamp).getTime() > ninetyDaysAgo
  );
  const recentQuizzes = data.quizzes.filter(
    (q) => new Date(q.timestamp).getTime() > ninetyDaysAgo
  );

  if (recentRecordings.length < 4 && recentQuizzes.length < 4) {
    return { hasEnoughData: false, indicators: [] };
  }

  // Split into first half (older) and second half (newer)
  const firstHalfRecordings = recentRecordings.filter(
    (r) => new Date(r.timestamp).getTime() < fortyFiveDaysAgo
  );
  const secondHalfRecordings = recentRecordings.filter(
    (r) => new Date(r.timestamp).getTime() >= fortyFiveDaysAgo
  );

  const firstHalfQuizzes = recentQuizzes.filter(
    (q) => new Date(q.timestamp).getTime() < fortyFiveDaysAgo
  );
  const secondHalfQuizzes = recentQuizzes.filter(
    (q) => new Date(q.timestamp).getTime() >= fortyFiveDaysAgo
  );

  const indicators = [];

  // Check response time increase (slower to start recording)
  if (firstHalfRecordings.length >= 2 && secondHalfRecordings.length >= 2) {
    const avgFirst = firstHalfRecordings.reduce((s, r) => s + r.responseTime, 0) / firstHalfRecordings.length;
    const avgSecond = secondHalfRecordings.reduce((s, r) => s + r.responseTime, 0) / secondHalfRecordings.length;
    if (avgSecond > avgFirst * 1.5) {
      indicators.push('Response time has increased significantly');
    }
  }

  // Check recording duration decrease (shorter stories)
  if (firstHalfRecordings.length >= 2 && secondHalfRecordings.length >= 2) {
    const avgFirst = firstHalfRecordings.reduce((s, r) => s + r.duration, 0) / firstHalfRecordings.length;
    const avgSecond = secondHalfRecordings.reduce((s, r) => s + r.duration, 0) / secondHalfRecordings.length;
    if (avgSecond < avgFirst * 0.6) {
      indicators.push('Recording detail richness has decreased');
    }
  }

  // Check quiz performance decrease
  if (firstHalfQuizzes.length >= 2 && secondHalfQuizzes.length >= 2) {
    const avgFirst = firstHalfQuizzes.reduce((s, q) => s + (q.questionsAnswered / q.totalQuestions), 0) / firstHalfQuizzes.length;
    const avgSecond = secondHalfQuizzes.reduce((s, q) => s + (q.questionsAnswered / q.totalQuestions), 0) / secondHalfQuizzes.length;
    if (avgSecond < avgFirst * 0.7) {
      indicators.push('Quiz completion rate has decreased');
    }
  }

  // Check frequency decrease
  if (firstHalfRecordings.length >= 2 && secondHalfRecordings.length >= 2) {
    // Normalize by time period
    const firstDays = 45;
    const secondDays = 45;
    const firstFreq = firstHalfRecordings.length / firstDays;
    const secondFreq = secondHalfRecordings.length / secondDays;
    if (secondFreq < firstFreq * 0.5) {
      indicators.push('Recording frequency has decreased');
    }
  }

  return {
    hasEnoughData: true,
    indicators,
    declineDetected: indicators.length >= 2,
  };
};

export const checkForFamilyAlert = async () => {
  try {
    // Check if consent was given
    const consent = await AsyncStorage.getItem('trackingConsent');
    if (consent !== 'true') return null;

    // Check if we already sent an alert recently (max once per 30 days)
    const lastAlert = await AsyncStorage.getItem('lastFamilyAlertDate');
    if (lastAlert) {
      const daysSince = (Date.now() - new Date(lastAlert).getTime()) / (24 * 60 * 60 * 1000);
      if (daysSince < 30) return null;
    }

    const analysis = await analyzeTrackingData();
    if (!analysis.hasEnoughData || !analysis.declineDetected) return null;

    // Mark alert as sent
    await AsyncStorage.setItem('lastFamilyAlertDate', new Date().toISOString());

    return `Memory Lane has detected some changes in activity patterns over the past 90 days: ${analysis.indicators.join(', ')}. This is not a diagnosis — just a gentle heads-up to stay connected.`;
  } catch (e) {
    return null;
  }
};
