import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Bubbles from '../../components/Bubbles';

const TUTORIAL_PAGES = [
    {
        icon: 'home',
        title: 'Home',
        description: 'This is your Memory Lane.\n\nEach circle on the road is a memory you\'ve recorded. Tap any circle to revisit it!',
    },
    {
        icon: 'mic',
        title: 'Record',
        description: 'Share a new memory each day.\n\nTap the microphone, tell your story, and add photos if you like.',
    },
    {
        icon: 'bulb',
        title: 'Quizzes',
        description: 'Fun quizzes to keep your mind active!\n\nAnswer questions about your memories and favourite things from the past.',
    },
    {
        icon: 'person',
        title: 'Profile',
        description: 'See your progress here.\n\nTrack how many memories you\'ve shared and your recording streak.',
    },
];

export default function TutorialScreen({ navigation }) {
    const [page, setPage] = useState(0);

    const current = TUTORIAL_PAGES[page];

    const handleNext = () => {
        if (page < TUTORIAL_PAGES.length - 1) {
            setPage(page + 1);
        } else {
            navigation.replace('MainTabs');
        }
    };

    const handleBack = () => {
        if (page > 0) setPage(page - 1);
    };

    return (
        <SafeAreaView style={styles.container}>
            <Bubbles maxBubbles={7} />

            <View style={styles.content}>
                <Text style={styles.logo}>Memory Lane</Text>

                {/* Progress dots */}
                <View style={styles.dotsRow}>
                    {TUTORIAL_PAGES.map((_, i) => (
                        <View
                            key={i}
                            style={[styles.dot, i === page && styles.dotActive]}
                        />
                    ))}
                </View>

                <View style={styles.cardArea}>
                    {/* Icon */}
                    <View style={styles.iconCircle}>
                        <Ionicons name={current.icon} size={50} color="#2A6F97" />
                    </View>

                    {/* Title */}
                    <Text style={styles.title}>{current.title}</Text>

                    {/* Description */}
                    <Text style={styles.description}>{current.description}</Text>
                </View>

                {/* Navigation arrows */}
                <View style={styles.navRow}>
                    {page > 0 ? (
                        <TouchableOpacity style={styles.navButton} onPress={handleBack}>
                            <Text style={styles.navArrow}>←</Text>
                        </TouchableOpacity>
                    ) : (
                        <View style={styles.navButtonPlaceholder} />
                    )}

                    <TouchableOpacity style={styles.navButton} onPress={handleNext}>
                        <Text style={styles.navArrow}>
                            {page === TUTORIAL_PAGES.length - 1 ? '✓' : '→'}
                        </Text>
                    </TouchableOpacity>
                </View>
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
        paddingHorizontal: 30,
        paddingTop: 10,
    },
    logo: {
        fontSize: 17,
        fontWeight: '400',
        color: '#595959',
        marginBottom: 20,
    },
    dotsRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 10,
        marginBottom: 40,
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#D9D9D9',
    },
    dotActive: {
        backgroundColor: '#2A6F97',
        width: 28,
    },
    cardArea: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: 40,
    },
    iconCircle: {
        width: 110,
        height: 110,
        borderRadius: 55,
        backgroundColor: '#E8F0F8',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 30,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 8,
            },
            android: {
                elevation: 5,
            },
        }),
    },
    title: {
        fontSize: 38,
        fontWeight: '700',
        color: '#1A1A2E',
        marginBottom: 20,
        textAlign: 'center',
    },
    description: {
        fontSize: 22,
        fontWeight: '500',
        color: '#505050',
        textAlign: 'center',
        lineHeight: 34,
        paddingHorizontal: 10,
    },
    navRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
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
    navButtonPlaceholder: {
        width: 56,
        height: 56,
    },
    navArrow: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1A1A2E',
    },
});
