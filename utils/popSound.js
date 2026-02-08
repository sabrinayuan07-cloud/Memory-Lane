import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy';

let popSoundObj = null;
let popFileReady = false;

/**
 * Generates a tiny 50ms pop WAV as base64.
 */
function generatePopWavBase64() {
    const sampleRate = 22050;
    const numSamples = 1102; // ~50ms
    const dataSize = numSamples * 2;
    const fileSize = 44 + dataSize;

    const bytes = new Uint8Array(fileSize);
    const view = new DataView(bytes.buffer);

    // "RIFF" header
    bytes[0] = 0x52; bytes[1] = 0x49; bytes[2] = 0x46; bytes[3] = 0x46;
    view.setUint32(4, fileSize - 8, true);
    // "WAVE"
    bytes[8] = 0x57; bytes[9] = 0x41; bytes[10] = 0x56; bytes[11] = 0x45;
    // "fmt " chunk
    bytes[12] = 0x66; bytes[13] = 0x6D; bytes[14] = 0x74; bytes[15] = 0x20;
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);    // PCM
    view.setUint16(22, 1, true);    // mono
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    // "data" chunk
    bytes[36] = 0x64; bytes[37] = 0x61; bytes[38] = 0x74; bytes[39] = 0x61;
    view.setUint32(40, dataSize, true);

    for (let i = 0; i < numSamples; i++) {
        const t = i / sampleRate;
        const envelope = Math.exp(-t * 50);
        const sample = Math.sin(2 * Math.PI * 800 * t) * envelope * 0.3;
        view.setInt16(44 + i * 2, Math.floor(sample * 32767), true);
    }

    // Base64 encode
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    let result = '';
    for (let i = 0; i < bytes.length; i += 3) {
        const b0 = bytes[i];
        const b1 = i + 1 < bytes.length ? bytes[i + 1] : 0;
        const b2 = i + 2 < bytes.length ? bytes[i + 2] : 0;
        result += chars[b0 >> 2];
        result += chars[((b0 & 3) << 4) | (b1 >> 4)];
        result += i + 1 < bytes.length ? chars[((b1 & 15) << 2) | (b2 >> 6)] : '=';
        result += i + 2 < bytes.length ? chars[b2 & 63] : '=';
    }
    return result;
}

async function ensurePopFile() {
    if (popFileReady) return;
    try {
        const uri = FileSystem.cacheDirectory + 'pop.wav';
        const info = await FileSystem.getInfoAsync(uri);
        if (!info.exists) {
            const base64 = generatePopWavBase64();
            await FileSystem.writeAsStringAsync(uri, base64, {
                encoding: 'base64',
            });
        }
        popFileReady = true;
    } catch (e) {
        // Non-critical
    }
}

// Pre-generate the file on import
ensurePopFile();

/**
 * Plays a soft pop sound effect.
 */
export async function playPop() {
    try {
        await ensurePopFile();
        if (popSoundObj) {
            await popSoundObj.unloadAsync();
            popSoundObj = null;
        }
        const uri = FileSystem.cacheDirectory + 'pop.wav';
        const { sound } = await Audio.Sound.createAsync(
            { uri },
            { shouldPlay: true, volume: 0.3 }
        );
        popSoundObj = sound;
        sound.setOnPlaybackStatusUpdate((status) => {
            if (status.didJustFinish) {
                sound.unloadAsync();
                if (popSoundObj === sound) popSoundObj = null;
            }
        });
    } catch (e) {
        // Pop sound is non-critical
    }
}
