import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy';
import { Alert } from 'react-native';
import { ELEVENLABS_API_KEY, ELEVENLABS_VOICE_ID } from './apiConfig';

let currentSound = null;

/**
 * Downloads audio from ElevenLabs as base64 using XMLHttpRequest.
 * XHR with blob responseType is the most reliable way to handle
 * binary HTTP responses in React Native.
 */
function fetchAudioBase64(text) {
    return new Promise((resolve, reject) => {
        const url = `https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`;
        const xhr = new XMLHttpRequest();
        xhr.open('POST', url);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.setRequestHeader('xi-api-key', ELEVENLABS_API_KEY);
        xhr.responseType = 'blob';
        xhr.timeout = 30000;

        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                const blob = xhr.response;
                const reader = new FileReader();
                reader.onloadend = () => {
                    if (reader.result) {
                        const base64 = reader.result.split(',')[1];
                        if (base64) {
                            resolve(base64);
                        } else {
                            reject(new Error('Empty base64 from response'));
                        }
                    } else {
                        reject(new Error('FileReader returned empty result'));
                    }
                };
                reader.onerror = () => reject(new Error('FileReader error'));
                reader.readAsDataURL(blob);
            } else {
                // Read error body
                const errReader = new FileReader();
                errReader.onloadend = () => {
                    reject(new Error(`API ${xhr.status}: ${errReader.result || 'unknown error'}`));
                };
                errReader.onerror = () => reject(new Error(`API error ${xhr.status}`));
                if (xhr.response) {
                    errReader.readAsText(xhr.response);
                } else {
                    reject(new Error(`API error ${xhr.status}`));
                }
            }
        };

        xhr.onerror = () => reject(new Error('Network request failed'));
        xhr.ontimeout = () => reject(new Error('Request timed out (30s)'));

        xhr.send(JSON.stringify({
            text: text,
            model_id: 'eleven_multilingual_v2',
            voice_settings: {
                stability: 0.75,
                similarity_boost: 0.75,
            },
        }));
    });
}

/**
 * Speaks text aloud using ElevenLabs TTS API.
 * @param {string} text - The text to speak
 * @param {function} onFinished - Optional callback when playback finishes
 * @returns {Promise<boolean>} true if playback started, false on error
 */
export async function speakText(text, onFinished) {
    if (!ELEVENLABS_API_KEY || ELEVENLABS_API_KEY === 'YOUR_ELEVENLABS_API_KEY_HERE') {
        Alert.alert('TTS Not Configured', 'Please add your ElevenLabs API key in utils/apiConfig.js');
        return false;
    }

    try {
        // Stop any currently playing audio
        if (currentSound) {
            await currentSound.unloadAsync();
            currentSound = null;
        }

        // Fetch audio as base64 via XHR
        const base64Audio = await fetchAudioBase64(text);

        const fileUri = FileSystem.cacheDirectory + 'tts_prompt.mp3';
        await FileSystem.writeAsStringAsync(fileUri, base64Audio, {
            encoding: 'base64',
        });

        // Configure audio mode for playback
        await Audio.setAudioModeAsync({
            allowsRecordingIOS: false,
            playsInSilentModeIOS: true,
            staysActiveInBackground: false,
            shouldDuckAndroid: true,
        });

        const { sound } = await Audio.Sound.createAsync(
            { uri: fileUri },
            { shouldPlay: true }
        );
        currentSound = sound;

        sound.setOnPlaybackStatusUpdate((status) => {
            if (status.didJustFinish) {
                sound.unloadAsync();
                currentSound = null;
                if (onFinished) onFinished();
            }
        });

        return true;
    } catch (error) {
        console.log('TTS Error:', error.message);
        Alert.alert('TTS Error', error.message || 'Could not play audio');
        return false;
    }
}

/**
 * Stops any currently playing TTS audio.
 */
export async function stopSpeaking() {
    if (currentSound) {
        await currentSound.stopAsync();
        await currentSound.unloadAsync();
        currentSound = null;
    }
}
