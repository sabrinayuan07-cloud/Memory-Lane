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
import AsyncStorage from '@react-native-async-storage/async-storage';
import Bubbles from '../../components/Bubbles';

const TOTAL_STEPS = 2;

export default function OnBoarding({ navigation }) {
    const [step, setStep] = useState(1);
    const [lovedOneName, setLovedOneName] = useState('');
    const [relationship, setRelationship] = useState('');

    const handleNext = async () => {
        if (step === 1) {
            if (!lovedOneName.trim()) {
                Alert.alert('Please enter your loved one\'s name');
                return;
            }
            setStep(2);
        } else if (step === 2) {
            if (!relationship.trim()) {
                Alert.alert('Please enter your relationship');
                return;
            }
            try {
                await AsyncStorage.setItem('lovedOneName', lovedOneName.trim());
                await AsyncStorage.setItem('relationship', relationship.trim());
                await AsyncStorage.setItem('userType', 'familyMember');
                await AsyncStorage.setItem('onboardingComplete', 'true');
            } catch (e) {
                console.log('Error saving data:', e);
            }
            navigation.replace('FamilyHome');
        }
    };

    const handleBack = () => {
        if (step > 1) {
            setStep(step - 1);
        } else {
            navigation.goBack();
        }
    };

    const ProgressBars = () => (
        <View style={styles.progressContainer}>
            {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((s) => (
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
            <Text style={styles.stepTitle}>What's your loved one's name?</Text>
            <Text style={styles.stepSubtitle}>
                This helps us personalize their Memory Lane
            </Text>
            <TextInput
                style={styles.textInput}
                placeholder="Enter their name"
                placeholderTextColor="#595959"
                value={lovedOneName}
                onChangeText={setLovedOneName}
                autoFocus
            />
        </View>
    );

    const renderStep2 = () => (
        <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>What's your relationship?</Text>
            <Text style={styles.stepSubtitle}>
                e.g., Daughter, Son, Grandchild, Caregiver
            </Text>
            <TextInput
                style={styles.textInput}
                placeholder="Enter your relationship"
                placeholderTextColor="#595959"
                value={relationship}
                onChangeText={setRelationship}
                autoFocus
            />
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
                    <Text style={styles.logo}>Memory Lane</Text>
                    <ProgressBars />
                </View>

                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                >
                    {step === 1 && renderStep1()}
                    {step === 2 && renderStep2()}
                </ScrollView>

                {/* Navigation arrows */}
                <View style={styles.navRow}>
                    <TouchableOpacity style={styles.navButton} onPress={handleBack}>
                        <Text style={styles.navArrow}>←</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.navButton} onPress={handleNext}>
                        <Text style={styles.navArrow}>
                            {step === TOTAL_STEPS ? '✓' : '→'}
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
        fontSize: 20,
        fontWeight: '400',
        color: '#595959',
        marginBottom: 16,
    },
    progressContainer: {
        flexDirection: 'row',
        gap: 8,
    },
    progressBar: {
        flex: 1,
        height: 5,
        borderRadius: 2.5,
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
        fontSize: 28,
        fontWeight: '700',
        color: '#1A1A2E',
        marginBottom: 10,
    },
    stepSubtitle: {
        fontSize: 18,
        color: '#505050',
        marginBottom: 24,
        lineHeight: 26,
    },
    textInput: {
        borderWidth: 1.5,
        borderColor: '#C0C8D4',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 16,
        fontSize: 20,
        color: '#1A1A2E',
        backgroundColor: '#fff',
    },
    navRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 30,
        paddingVertical: 20,
        paddingBottom: 30,
    },
    navButton: {
        width: 56,
        height: 56,
        borderRadius: 28,
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
        fontSize: 24,
        fontWeight: '700',
        color: '#1A1A2E',
    },
});