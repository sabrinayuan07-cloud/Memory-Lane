import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
} from 'react-native';

export default function RecordScreen() {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.logo}>Memory Lane</Text>
                <Text style={styles.title}>Add a Memory</Text>
                <Text style={styles.subtitle}>
                    Record or upload a memory for your loved one
                </Text>
                {/* TODO: Implement family member record functionality */}
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
        fontSize: 20,
        fontWeight: '400',
        color: '#595959',
        marginBottom: 20,
    },
    title: {
        fontSize: 30,
        fontWeight: '700',
        color: '#1A1A2E',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 18,
        color: '#505050',
    },
});