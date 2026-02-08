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

export default function WelcomeScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <Bubbles animated forceMixed />

      <View style={styles.content}>
        {/* Title pushed toward upper portion */}
        <View style={styles.topSpacer} />

        <View style={styles.textBlock}>
          <Text style={styles.welcomeText}>Welcome to</Text>
          <Text style={styles.appName}>Memory Lane</Text>
        </View>

        {/* Gap between title and subtitle */}
        <View style={styles.middleSpacer} />

        <View style={styles.subtitleBlock}>
          <Text style={styles.subtitle}>
            Your memories matter.{'\n'}We're here to help you{'\n'}save them forever.
          </Text>
        </View>

        {/* Space between subtitle and button */}
        <View style={styles.buttonSpacer} />

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('UserSelection')}
          activeOpacity={0.7}
        >
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>

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
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  topSpacer: {
    flex: 0.35,
  },
  textBlock: {
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: '300',
    color: '#1A1A2E',
    marginBottom: 4,
  },
  appName: {
    fontSize: 44,
    fontWeight: '700',
    color: '#1A1A2E',
  },
  middleSpacer: {
    flex: 0.55,
  },
  subtitleBlock: {
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 26,
    fontWeight: '600',
    color: '#1A1A2E',
    textAlign: 'center',
    lineHeight: 38,
  },
  buttonSpacer: {
    flex: 0.35,
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 55,
    borderRadius: 30,
    borderWidth: 1.5,
    borderColor: '#C0C8D4',
    backgroundColor: '#C0E2FE',
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
  buttonText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A2E',
  },
  bottomSpacer: {
    flex: 0.5,
  },
});