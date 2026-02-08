import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import Bubbles from '../components/Bubbles';

export default function RecordScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Bubbles />
      <View style={styles.content}>
        <Text style={styles.logo}>MemoryLane</Text>
        <Text style={styles.title}>Record</Text>
        <Text style={styles.subtitle}>Voice recording coming soon</Text>
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
    paddingHorizontal: 24,
    paddingTop: 10,
  },
  logo: {
    fontSize: 18,
    fontWeight: '400',
    color: '#B0B0B0',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1A2E',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
});
