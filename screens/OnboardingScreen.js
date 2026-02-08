import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  Alert,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Bubbles from '../components/Bubbles';

export default function OnboardingScreen({ navigation }) {
  const [step, setStep] = useState(1);

  // Step 1 state
  const [name, setName] = useState('');
  const [birthday, setBirthday] = useState(new Date(1960, 0, 1));
  const [showDatePicker, setShowDatePicker] = useState(Platform.OS === 'ios');

  // Step 2 state
  const [cityInput, setCityInput] = useState('');
  const [cities, setCities] = useState([]);

  // Step 3 state
  const [emailInput, setEmailInput] = useState('');
  const [emails, setEmails] = useState([]);

  const handleNext = async () => {
    if (step === 1) {
      if (!name.trim()) {
        Alert.alert('Please enter your name');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    } else if (step === 3) {
      // Save all data and navigate to home
      try {
        await AsyncStorage.setItem('userName', name.trim());
        await AsyncStorage.setItem('userBirthday', birthday.toISOString());
        await AsyncStorage.setItem('userCities', JSON.stringify(cities));
        await AsyncStorage.setItem('userEmails', JSON.stringify(emails));
        await AsyncStorage.setItem('onboardingComplete', 'true');
      } catch (e) {
        console.log('Error saving data:', e);
      }
      navigation.replace('MainTabs');
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const addCity = () => {
    const trimmed = cityInput.trim();
    if (trimmed && cities.length < 5 && !cities.includes(trimmed)) {
      setCities([...cities, trimmed]);
      setCityInput('');
    }
  };

  const removeCity = (index) => {
    setCities(cities.filter((_, i) => i !== index));
  };

  const addEmail = () => {
    const trimmed = emailInput.trim();
    if (trimmed && !emails.includes(trimmed)) {
      setEmails([...emails, trimmed]);
      setEmailInput('');
    }
  };

  const removeEmail = (index) => {
    setEmails(emails.filter((_, i) => i !== index));
  };

  const onDateChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setBirthday(selectedDate);
    }
  };

  // Progress bar component
  const ProgressBars = () => (
    <View style={styles.progressContainer}>
      {[1, 2, 3].map((s) => (
        <View
          key={s}
          style={[
            styles.progressBar,
            s <= step ? styles.progressBarActive : styles.progressBarInactive,
          ]}
        />
      ))}
    </View>
  );

  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>What's your name?</Text>
      <TextInput
        style={styles.textInput}
        placeholder="Enter your name"
        placeholderTextColor="#999"
        value={name}
        onChangeText={setName}
        autoFocus
      />

      <Text style={[styles.stepTitle, { marginTop: 40 }]}>
        When were you born?
      </Text>

      {Platform.OS === 'android' && (
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.dateButtonText}>
            {birthday.toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </Text>
        </TouchableOpacity>
      )}

      {showDatePicker && (
        <DateTimePicker
          value={birthday}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onDateChange}
          maximumDate={new Date()}
          minimumDate={new Date(1920, 0, 1)}
          style={styles.datePicker}
        />
      )}
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Where did you grow up?</Text>
      <Text style={styles.stepSubtitle}>Add up to 5 cities</Text>

      <View style={styles.inputRow}>
        <TextInput
          style={[styles.textInput, { flex: 1 }]}
          placeholder="Enter a city"
          placeholderTextColor="#999"
          value={cityInput}
          onChangeText={setCityInput}
          onSubmitEditing={addCity}
        />
        <TouchableOpacity
          style={[styles.addButton, cities.length >= 5 && styles.addButtonDisabled]}
          onPress={addCity}
          disabled={cities.length >= 5}
        >
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tagContainer}>
        {cities.map((city, index) => (
          <View key={index} style={styles.tag}>
            <Text style={styles.tagText}>{city}</Text>
            <TouchableOpacity onPress={() => removeCity(index)}>
              <Text style={styles.tagRemove}>  ✕</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Invite family members</Text>
      <Text style={styles.stepSubtitle}>
        Share Memory Lane with your loved ones
      </Text>

      <Text style={styles.inputLabel}>Family Member's Email:</Text>
      <TextInput
        style={styles.textInput}
        placeholder="email@example.com"
        placeholderTextColor="#999"
        value={emailInput}
        onChangeText={setEmailInput}
        keyboardType="email-address"
        autoCapitalize="none"
        onSubmitEditing={addEmail}
      />

      <TouchableOpacity style={styles.addAnotherButton} onPress={addEmail}>
        <Text style={styles.addAnotherText}>+ Add Another</Text>
      </TouchableOpacity>

      <View style={styles.tagContainer}>
        {emails.map((email, index) => (
          <View key={index} style={styles.tag}>
            <Text style={styles.tagText}>{email}</Text>
            <TouchableOpacity onPress={() => removeEmail(index)}>
              <Text style={styles.tagRemove}>  ✕</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {emails.length > 0 && (
        <TouchableOpacity style={styles.sendButton}>
          <Text style={styles.sendButtonText}>Send Invites</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Bubbles />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header with logo and progress */}
        <View style={styles.header}>
          <Text style={styles.logo}>MemoryLane</Text>
          <ProgressBars />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </ScrollView>

        {/* Navigation arrows */}
        <View style={styles.navRow}>
          {step > 1 ? (
            <TouchableOpacity style={styles.navButton} onPress={handleBack}>
              <Text style={styles.navArrow}>←</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.navButton} />
          )}

          <TouchableOpacity style={styles.navButton} onPress={handleNext}>
            <Text style={styles.navArrow}>
              {step === 3 ? '✓' : '→'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFBFF',
  },
  flex: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 10,
  },
  logo: {
    fontSize: 18,
    fontWeight: '400',
    color: '#B0B0B0',
    marginBottom: 16,
  },
  progressContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  progressBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  progressBarActive: {
    backgroundColor: '#1A1A2E',
  },
  progressBarInactive: {
    backgroundColor: '#D9D9D9',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 30,
    paddingTop: 30,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1A1A2E',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  textInput: {
    borderWidth: 1.5,
    borderColor: '#C0C8D4',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 18,
    color: '#1A1A2E',
    backgroundColor: '#fff',
  },
  dateButton: {
    borderWidth: 1.5,
    borderColor: '#C0C8D4',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#fff',
  },
  dateButtonText: {
    fontSize: 18,
    color: '#1A1A2E',
  },
  datePicker: {
    marginTop: 10,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  addButton: {
    backgroundColor: '#C0E2FE',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#C0C8D4',
  },
  addButtonDisabled: {
    opacity: 0.4,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A2E',
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 20,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#C0E2FE',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  tagText: {
    fontSize: 15,
    color: '#1A1A2E',
  },
  tagRemove: {
    fontSize: 15,
    color: '#666',
    fontWeight: '600',
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A2E',
    marginBottom: 10,
  },
  addAnotherButton: {
    marginTop: 16,
    alignSelf: 'flex-start',
  },
  addAnotherText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#5A8FBF',
  },
  sendButton: {
    marginTop: 30,
    backgroundColor: '#C0E2FE',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 30,
    alignSelf: 'center',
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
  sendButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A2E',
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 30,
    paddingVertical: 20,
    paddingBottom: 30,
  },
  navButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#C0E2FE',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  navArrow: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1A2E',
  },
});
