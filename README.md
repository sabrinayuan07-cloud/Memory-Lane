# Memory Lane

A mobile app built for elderly users to record, revisit, and share their life memories with family. Designed with accessibility in mind — large text, simple navigation, and voice-first interactions.

## What it does

**For seniors:**
- **Daily memory prompts** — each day the app asks a personal question to spark a story (e.g. "What was your favourite meal your mother made?"). Prompts adapt over time based on what the user has already shared.
- **Voice recording** — tap to record a memory, attach photos, and save it. Recordings are transcribed and summarized so family members can read them later.
- **Memory Road** — a visual timeline of all saved memories, displayed as an interactive path.
- **Quizzes** — nostalgia-based trivia from the user's era (1940s–1970s) and personalized recall questions built from their own memories and photos.
- **Text-to-speech** — prompts and quiz questions can be read aloud using ElevenLabs TTS.

**For family members:**
- Separate family login with its own onboarding
- View the senior's memory timeline
- Add memories on their behalf
- Track engagement (recordings, quiz activity)

## Tech stack

- React Native + Expo
- React Navigation (stack + bottom tabs)
- AsyncStorage for local data persistence
- Gemini API for personalized prompt generation and audio summarization
- ElevenLabs API for text-to-speech
- Expo AV for audio recording/playback
- Expo Image Picker for photo attachments

## Getting started

```bash
# install dependencies
npm install

# start the dev server
npx expo start

# or use tunnel mode if on a different network
npx expo start --tunnel
```

Scan the QR code with Expo Go on your phone.

## API keys

The app uses two optional external APIs. Without them, the app still works — it falls back to static prompts and skips audio summaries.

- **Gemini API** — generates personalized daily prompts and summarizes voice recordings
- **ElevenLabs** — reads prompts and quiz questions aloud

Add your keys in `utils/apiConfig.js`.

## Project structure

```
screens/
  user/           # senior-facing screens
    HomeScreen    # daily prompt + memory road
    RecordScreen  # voice recording + photo capture
    QuizzesScreen # nostalgia + memory recall quizzes
    ProfileScreen # user profile + stats
  family/         # family member screens
    HomeScreen    # view loved one's memories
    RecordScreen  # add memories for them
    ProfileScreen # engagement tracking
components/
  MemoryRoad      # interactive memory timeline
  Bubbles         # floating background animation
  AnimatedButton  # press animation wrapper
utils/
  geminiPrompts   # daily prompt generation via Gemini
  geminiSummary   # audio-to-summary via Gemini
  elevenLabsTTS   # text-to-speech via ElevenLabs
  memoryTracking  # engagement + usage logging
```
