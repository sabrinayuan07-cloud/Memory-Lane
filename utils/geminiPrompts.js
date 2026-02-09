import AsyncStorage from '@react-native-async-storage/async-storage';
import { GEMINI_API_KEY } from './apiConfig';

const FALLBACK_PROMPTS = [
    { prompt: 'What was your favourite meal your mother made?', category: 'food', label: "Mom's Cooking" },
    { prompt: 'Tell me about the first time you fell in love.', category: 'family', label: 'First Love' },
    { prompt: 'What did your neighborhood smell like in summer?', category: 'nature', label: 'Summer Days' },
    { prompt: 'What was your proudest moment at work?', category: 'work', label: 'Proudest Moment' },
    { prompt: 'Who was your best friend growing up?', category: 'friendship', label: 'Childhood Friend' },
    { prompt: 'What was your favorite game to play as a child?', category: 'childhood', label: 'Childhood Games' },
    { prompt: 'Describe a holiday tradition from your childhood.', category: 'holiday', label: 'Holiday Tradition' },
    { prompt: 'What was the first job you ever had?', category: 'work', label: 'First Job' },
    { prompt: 'What song brings back the strongest memory?', category: 'music', label: 'A Special Song' },
    { prompt: 'Tell me about a place that felt like home.', category: 'family', label: 'Feeling of Home' },
];

function getFallbackPrompt() {
    const dayOfYear = Math.floor(
        (Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000
    );
    return FALLBACK_PROMPTS[dayOfYear % FALLBACK_PROMPTS.length];
}

/**
 * Builds a context summary string from the user's profile and past memories.
 */
function buildUserContext(birthday, citiesJson, memoriesJson) {
    const parts = [];

    // Age
    if (birthday) {
        const birthYear = new Date(birthday).getFullYear();
        const age = new Date().getFullYear() - birthYear;
        const decade = Math.floor((birthYear + 10) / 10) * 10;
        parts.push(`The person is approximately ${age} years old, grew up in the ${decade}s.`);
    }

    // Cities / cultural background
    if (citiesJson) {
        try {
            const cities = JSON.parse(citiesJson);
            if (cities.length > 0) {
                parts.push(`They grew up in: ${cities.join(', ')}.`);
            }
        } catch (e) { /* ignore */ }
    }

    // Past memories — topics, labels, summaries, and prompts already asked
    if (memoriesJson) {
        try {
            const memories = JSON.parse(memoriesJson);
            if (memories.length > 0) {
                const recentMemories = memories.slice(0, 20);

                const previousPrompts = recentMemories
                    .map((m) => m.prompt)
                    .filter(Boolean);
                if (previousPrompts.length > 0) {
                    parts.push(`Prompts already asked (DO NOT repeat these): ${previousPrompts.map((p) => `"${p}"`).join('; ')}`);
                }

                const topics = recentMemories
                    .map((m) => m.label || m.category)
                    .filter(Boolean);
                if (topics.length > 0) {
                    parts.push(`Topics they've shared about: ${[...new Set(topics)].join(', ')}.`);
                }

                const summaries = recentMemories
                    .map((m) => m.summary)
                    .filter((s) => s && !s.startsWith('Shared a memory about'));
                if (summaries.length > 0) {
                    parts.push(`Recent story summaries for context:\n${summaries.slice(0, 5).map((s) => `- ${s}`).join('\n')}`);
                }
            }
        } catch (e) { /* ignore */ }
    }

    return parts.join('\n');
}

/**
 * Calls Gemini to generate a personalized memory prompt.
 * Returns { prompt, category, label } or null on failure.
 */
async function callGeminiForPrompt(userContext) {
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
                                text: `You are a warm, gentle memory companion for an elderly person. Your job is to generate a single memory prompt — a question that will spark a vivid, personal story from their past.

Here is what you know about this person:
${userContext}

Rules:
- Generate exactly ONE question that feels natural and personal
- If they mentioned specific topics (like farming, a city, a hobby), create a follow-up prompt that digs deeper into those themes
- If there's not much history yet, ask a warm, universal question about childhood, family, food, music, or traditions
- The question should be conversational, not clinical — like a loving grandchild asking
- Keep it to 1-2 sentences maximum
- Do NOT repeat any prompt that was already asked

Respond in this exact JSON format (no markdown, no code blocks):
{"prompt": "your question here", "category": "one-word category", "label": "short 2-3 word title"}

Category must be one of: food, family, work, music, travel, friendship, childhood, nature, holiday, school, community, health, love, tradition, adventure`,
                            },
                        ],
                    },
                ],
                generationConfig: {
                    maxOutputTokens: 150,
                    temperature: 0.9,
                },
            }),
        }
    );

    if (!response.ok) {
        console.log('Gemini prompt API error:', response.status);
        return null;
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return null;

    // Parse JSON response — handle potential markdown wrapping
    const cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    try {
        const parsed = JSON.parse(cleaned);
        if (parsed.prompt && parsed.category && parsed.label) {
            return parsed;
        }
    } catch (e) {
        console.log('Failed to parse Gemini prompt response:', cleaned);
    }

    return null;
}

/**
 * Gets today's personalized memory prompt.
 * Caches the result per day. Falls back to static prompts if Gemini fails.
 * Returns { prompt, category, label }
 */
export async function getDailyPrompt() {
    try {
        // Check cache first
        const cached = await AsyncStorage.getItem('cachedDailyPrompt');
        if (cached) {
            const data = JSON.parse(cached);
            if (data.date === new Date().toDateString()) {
                return { prompt: data.prompt, category: data.category, label: data.label };
            }
        }

        // Skip API if key not configured
        if (!GEMINI_API_KEY || GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
            return getFallbackPrompt();
        }

        // Gather user context
        const [birthday, citiesJson, memoriesJson] = await Promise.all([
            AsyncStorage.getItem('userBirthday'),
            AsyncStorage.getItem('userCities'),
            AsyncStorage.getItem('memories'),
        ]);

        const userContext = buildUserContext(birthday, citiesJson, memoriesJson);

        // Call Gemini
        const result = await callGeminiForPrompt(userContext);

        if (result) {
            // Cache for today
            await AsyncStorage.setItem('cachedDailyPrompt', JSON.stringify({
                ...result,
                date: new Date().toDateString(),
            }));
            return result;
        }
    } catch (error) {
        console.log('Error generating daily prompt:', error);
    }

    // Fallback
    return getFallbackPrompt();
}
