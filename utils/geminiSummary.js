import * as FileSystem from 'expo-file-system/legacy';
import { GEMINI_API_KEY } from './apiConfig';

/**
 * Detects MIME type from a file URI extension.
 */
function getMimeType(uri) {
    const ext = uri.split('.').pop().toLowerCase();
    const mimeMap = {
        caf: 'audio/x-caf',
        m4a: 'audio/mp4',
        mp4: 'audio/mp4',
        '3gp': 'audio/3gpp',
        wav: 'audio/wav',
        mp3: 'audio/mpeg',
        aac: 'audio/aac',
        ogg: 'audio/ogg',
        flac: 'audio/flac',
    };
    return mimeMap[ext] || 'audio/mp4';
}

/**
 * Sends an audio recording to Gemini API and returns an AI-generated summary.
 * @param {string} audioUri - Local file URI of the recording
 * @param {string} prompt - The prompt the senior was responding to
 * @returns {Promise<string>} AI summary text
 */
export async function generateMemorySummary(audioUri, prompt) {
    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
        console.log('Gemini API key not configured');
        return null;
    }

    try {
        // Read audio file as base64
        const base64Audio = await FileSystem.readAsStringAsync(audioUri, {
            encoding: 'base64',
        });

        const mimeType = getMimeType(audioUri);

        // Call Gemini API with audio
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [
                                {
                                    inlineData: {
                                        mimeType: mimeType,
                                        data: base64Audio,
                                    },
                                },
                                {
                                    text: `This is a voice recording of an elderly person sharing a memory in response to this prompt: "${prompt}". Please provide a warm, concise summary (2-3 sentences) of what they shared. If you cannot understand the audio clearly, provide a brief note about the topic based on the prompt. Keep the tone gentle and respectful.`,
                                },
                            ],
                        },
                    ],
                    generationConfig: {
                        maxOutputTokens: 200,
                        temperature: 0.7,
                    },
                }),
            }
        );

        if (!response.ok) {
            const errorText = await response.text().catch(() => '');
            console.log('Gemini API error:', response.status, errorText);
            return null;
        }

        const data = await response.json();
        const summary = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        return summary || null;
    } catch (error) {
        console.log('Error generating summary:', error);
        return null;
    }
}
