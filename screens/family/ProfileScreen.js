import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

export default function ProfileScreen() {
    const [lovedOneName, setLovedOneName] = useState('');
    const [relationship, setRelationship] = useState('');

    useFocusEffect(
        useCallback(() => {
            const loadData = async () => {
                try {
                    const name = await AsyncStorage.getItem('lovedOneName');
                    if (name) setLovedOneName(name);

                    const rel = await AsyncStorage.getItem('relationship');
                    if (rel) setRelationship(rel);
                } catch (e) {
                    console.log('Error loading data:', e);
                }
            };
            loadData();
        }, [])
    );

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                <Text style={styles.logo}>Memory Lane</Text>
                <Text style={styles.title}>Profile</Text>

                <View style={styles.infoCard}>
                    <Text style={styles.label}>Caring for:</Text>
                    <Text style={styles.value}>{lovedOneName || 'Not set'}</Text>
                </View>

                <View style={styles.infoCard}>
                    <Text style={styles.label}>Relationship:</Text>
                    <Text style={styles.value}>{relationship || 'Not set'}</Text>
                </View>

                {/* TODO: Add settings, notifications, and other profile features */}
            </ScrollView>
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
        paddingHorizontal: 24,
        paddingTop: 10,
        paddingBottom: 30,
    },
    logo: {
        fontSize: 20,
        fontWeight: '400',
        color: '#595959',
        marginBottom: 20,
    },
    title: {
        fontSize: 30,
        fontWeight: '700',
        color: '#1A1A2E',
        marginBottom: 24,
    },
    infoCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: '#C0C8D4',
        padding: 20,
        marginBottom: 16,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#595959',
        marginBottom: 8,
    },
    value: {
        fontSize: 20,
        fontWeight: '600',
        color: '#1A1A2E',
    },
});