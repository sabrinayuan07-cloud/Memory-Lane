import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    TextInput,
    ScrollView,
    Image,
    Alert,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Bubbles from '../../components/Bubbles';

export default function RecordScreen({ navigation }) {
    const [description, setDescription] = useState('');
    const [photo, setPhoto] = useState(null);

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            quality: 0.8,
        });
        
        if (!result.canceled) {
            setPhoto(result.assets[0].uri);
        }
    };

    const saveMemory = async () => {
        if (!description.trim() && !photo) {
            Alert.alert('Please add a description or photo');
            return;
        }

        try {
            const existing = await AsyncStorage.getItem('memories');
            let memories = existing ? JSON.parse(existing) : [];

            const newMemory = {
                id: Date.now(),
                dateISO: new Date().toISOString(),
                date: new Date().toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                }),
                prompt: 'Family shared memory',
                category: 'family',
                label: description.substring(0, 30) || 'A Special Memory',
                summary: description,
                hasRecording: false,
                photos: photo ? [photo] : [],
                duration: 0,
                addedByFamily: true,
            };

            memories.unshift(newMemory);
            await AsyncStorage.setItem('memories', JSON.stringify(memories));

            Alert.alert('Success', 'Memory added to Memory Lane!');
            setDescription('');
            setPhoto(null);
            navigation.navigate('FamilyHome');
        } catch (e) {
            console.log('Error saving memory:', e);
            Alert.alert('Error', 'Could not save memory');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <Bubbles />
            <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
                <Text style={styles.logo}>Memory Lane</Text>
                <Text style={styles.title}>Add a Memory</Text>
                <Text style={styles.subtitle}>
                    Share a special moment with your loved one
                </Text>

                {/* Upload Photo Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>Upload Photo (Optional)</Text>
                    <TouchableOpacity style={styles.uploadBox} onPress={pickImage}>
                        {photo ? (
                            <Image source={{ uri: photo }} style={styles.uploadedImage} />
                        ) : (
                            <>
                                <View style={styles.uploadIcon}>
                                    <Ionicons name="images-outline" size={40} color="#5A7A5C" />
                                </View>
                                <Text style={styles.uploadText}>Tap to upload a photo</Text>
                                <Text style={styles.uploadSubtext}>JPG, PNG up to 10MB</Text>
                            </>
                        )}
                    </TouchableOpacity>
                    {photo && (
                        <TouchableOpacity style={styles.changePhotoButton} onPress={pickImage}>
                            <Text style={styles.changePhotoText}>Change Photo</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Description Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>Memory Description</Text>
                    <TextInput
                        style={styles.textArea}
                        placeholder="Describe this memory... What was happening? Where were you? Who was there?"
                        placeholderTextColor="#999"
                        value={description}
                        onChangeText={setDescription}
                        multiline
                        numberOfLines={6}
                        textAlignVertical="top"
                    />
                </View>

                {/* Save Button */}
                <TouchableOpacity style={styles.saveButton} onPress={saveMemory}>
                    <Text style={styles.saveButtonText}>Add to Memory Lane</Text>
                </TouchableOpacity>
            </ScrollView>
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
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingTop: 10,
        paddingBottom: 40,
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
        marginBottom: 30,
    },
    section: {
        marginBottom: 30,
    },
    sectionLabel: {
        fontSize: 14,
        color: '#5A7A5C',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 12,
    },
    uploadBox: {
        borderWidth: 2,
        borderColor: '#A8C5A9',
        borderStyle: 'dashed',
        borderRadius: 20,
        padding: 40,
        alignItems: 'center',
        backgroundColor: 'rgba(176, 196, 177, 0.05)',
    },
    uploadIcon: {
        width: 80,
        height: 80,
        backgroundColor: '#D0E4CD',
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 15,
    },
    uploadText: {
        fontSize: 16,
        color: '#5A7A5C',
        fontWeight: '500',
        marginBottom: 5,
    },
    uploadSubtext: {
        fontSize: 13,
        color: '#999',
    },
    uploadedImage: {
        width: '100%',
        height: 200,
        borderRadius: 12,
    },
    changePhotoButton: {
        marginTop: 12,
        alignSelf: 'center',
    },
    changePhotoText: {
        fontSize: 16,
        color: '#5A7A5C',
        fontWeight: '600',
    },
    textArea: {
        borderWidth: 2,
        borderColor: '#E8EDE8',
        borderRadius: 15,
        padding: 16,
        fontSize: 16,
        color: '#1A1A2E',
        backgroundColor: '#fff',
        minHeight: 150,
    },
    saveButton: {
        backgroundColor: '#A8C5A9',
        paddingVertical: 16,
        borderRadius: 30,
        alignItems: 'center',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 8,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    saveButtonText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#fff',
    },
});