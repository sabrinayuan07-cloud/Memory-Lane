import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
} from 'react-native';
import Bubbles from '../components/Bubbles';

export default function UserSelectionScreen({ navigation }) {
  const handleSelection = (userType) => {
    if (userType === 'self') {
      navigation.navigate('Onboarding');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Bubbles />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>Memory Lane</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.spacer} />

        <Text style={styles.heading}>
          How will you be using{'\n'}Memory Lane?
        </Text>

        <View style={styles.optionsContainer}>
          {/* Option 1: For myself */}
          <View style={styles.optionBlock}>
            <TouchableOpacity
              style={styles.optionButton}
              onPress={() => handleSelection('self')}
              activeOpacity={0.7}
            >
              <Text style={styles.optionButtonText}>
                I'm using this for myself
              </Text>
            </TouchableOpacity>
            <Text style={styles.optionDescription}>
              For personal memory keeping{'\n'}and reflection
            </Text>
          </View>

          {/* Option 2: Helping a loved one */}
          <View style={styles.optionBlock}>
            <TouchableOpacity
              style={styles.optionButton}
              onPress={() => handleSelection('caregiver')}
              activeOpacity={0.7}
            >
              <Text style={styles.optionButtonText}>
                I'm helping a loved one
              </Text>
            </TouchableOpacity>
            <Text style={styles.optionDescription}>
              For family members or caregivers
            </Text>
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFBFF',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 10,
  },
  logo: {
    fontSize: 20,
    fontWeight: '400',
    color: '#B0B0B0',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  spacer: {
    flex: 0.6,
  },
  heading: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1A1A2E',
    textAlign: 'center',
    lineHeight: 42,
    marginBottom: 50,
  },
  optionsContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 30,
  },
  optionBlock: {
    alignItems: 'center',
  },
  optionButton: {
    paddingVertical: 16,
    paddingHorizontal: 35,
    borderRadius: 30,
    borderWidth: 1.5,
    borderColor: '#C0C8D4',
    backgroundColor: '#C0E2FE',
    marginBottom: 10,
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
  optionButtonText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A2E',
    textAlign: 'center',
  },
  optionDescription: {
    fontSize: 17,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  bottomSpacer: {
    flex: 1,
  },
});
