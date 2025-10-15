## Arogya AI - Healthcare Symptom Checker

Educational app to input symptoms and receive probable conditions and recommended next steps. This project includes a backend API that queries OpenAI models (text: gpt-4o-mini, image: gpt-4.1-mini, speech-to-text: whisper-1), optional image/audio inputs, and an authenticated history stored in Firebase. All outputs include safety disclaimers and are for educational purposes only.

> Important: This app does not provide medical advice, diagnosis or treatment. Always consult a qualified healthcare professional.

### Objectives
- Accept user symptom input (text; optional image/audio)
- Generate probable conditions and next steps via LLM
- Include explicit safety/educational disclaimers
- Optionally store user query history

## Tech Stack
- Next.js App Router (TypeScript, React)
- OpenAI API for reasoning (text, images, speech-to-text)
- Clerk for authentication
- Firebase Admin + Firestore for server-side persistence; Firebase Web SDK for client
- Tailwind CSS + Radix UI (components in `components/ui`)

## Project Structure
- API routes
  - `app/api/check-text/route.ts`: Analyze symptom text with LLM; saves per-user results
  - `app/api/check-image/route.ts`: Vision analysis for uploaded image; saves per-user result
  - `app/api/stream-audio/route.ts`: Transcribe audio via Whisper then forwards to text analysis
- Client
  - `components/chat-interface.tsx`, `components/chat-input.tsx`, `components/chat-messages.tsx` (UI)
  - `lib/firebase.ts` (client Firestore init)

## Environment Variables
Create a `.env.local` at the repo root:

```bash
# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Clerk (example names; match your Clerk dashboard)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...

# Firebase Admin (server)
FIREBASE_DB_URL=https://<your-project>.firebaseio.com

# Firebase Web (client)
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

Additionally, place your Firebase Admin service account JSON at the project root as `firebase-service-account.json` (path referenced by API routes). Keep this file out of source control.

## Requirements
- Node.js 18+ (recommended: 20+)
- An OpenAI API key with access to `gpt-4o-mini`, `gpt-4.1-mini`, and `whisper-1`
- A Firebase project (Firestore enabled) and a service account JSON
- A Clerk application configured for your local and deployed URLs

## Installation & Run
```bash
npm install
npm run dev
# app runs at http://localhost:3000
```

## API

All endpoints are server-side and require `OPENAI_API_KEY`. Some routes require authentication via Clerk; ensure you are signed in through the app UI before calling.

### POST /api/check-text
Analyze free-form symptom text.

Request:
```bash
curl -X POST http://localhost:3000/api/check-text \
  -H "Content-Type: application/json" \
  --cookie "<your_cookies_if_auth_required>" \
  -d '{"symptoms":"Fever, sore throat for 2 days, mild cough"}'
```

Response:
```json
{
  "diagnosis": "...model response with conditions, next steps, and disclaimer...",
  "debug": {
    "userId": "...",
    "savedTo": "users/<id>/diagnosis"
  }
}
```

Storage:
- Saves a document under `users/{clerkUserId}/diagnosis` with `symptoms`, `answer`, `type: "text"`, and timestamp.

Auth:
- Requires a valid Clerk session (`currentUser`).

### POST /api/check-image
Analyze an uploaded image (e.g., skin rash) using vision capabilities.

Request (multipart/form-data):
```bash
curl -X POST http://localhost:3000/api/check-image \
  -H "Cookie: <your_cookies_if_auth_required>" \
  -F image=@"/path/to/photo.jpg"
```

Response:
```json
{
  "diagnosis": "...vision analysis with next steps and disclaimer...",
  "imageData": "data:<mime>;base64,..."
}
```

Storage:
- Saves a document under `users/{clerkUserId}/diagnosis` with `imageName`, `imageData` (data URI), `answer`, `type: "image"`.

Auth:
- Requires a valid Clerk session (`currentUser`).

### POST /api/stream-audio
Transcribe audio (patient narrative) with Whisper and forward to `/api/check-text` for analysis.

Request (multipart/form-data):
```bash
curl -X POST http://localhost:3000/api/stream-audio \
  -F audio=@"/path/to/audio.wav"
```

Response:
```json
{
  "transcription": "...",
  "diagnosis": "..."
}
```

Storage:
- Adds a document in `queries` with `audioTranscription`, `answer`, and `createdAt`.

Auth:
- Does not itself check `currentUser`. The forwarded call to `/api/check-text` will include cookies if present; otherwise, `diagnosis` may be `null` and only the transcription is returned.

## Prompting & Safety
The text analysis uses a structured prompt to ensure:
- Summarized symptoms and critical red flags
- Probable conditions with appropriate Reasoning
- Concrete next steps (home care, tests, when to seek urgent care)
- Risk context (age, comorbidities, duration, severity)
- Mandatory educational disclaimer

Example user prompt:
> "I have been suffering from headaches and fever since the last 4 days, I am 23 , Male."

Safety policy:
- Outputs are informational/educational only; not a diagnosis
- Encourage consulting healthcare professionals
- Highlight urgent-care triggers for severe/worsening symptoms

Data handling:
- Image uploads are converted to data URIs and (in this demo) saved in Firestore; avoid storing sensitive PHI in production and prefer secure storage.
- Do not commit `firebase-service-account.json` or any secrets to source control.

## Frontend
This repo includes a basic chat-style interface (`components/chat-interface.tsx`) for entering symptoms and viewing responses. It can be extended with structured forms and validation.

Quick UI flow:
- Sign in via routes under `app/(auth)`
- Use the chat interface to submit symptoms as text; results appear in `components/chat-messages.tsx`
- Optional: upload an image via the UI (if enabled) or call the API directly

## Development Notes
- Authentication: Routes such as `check-text` and `check-image` expect a valid Clerk session (`currentUser`). Ensure the app sign-in flow is configured via files in `app/(auth)`.
- Service Account: The server uses Admin SDK via `firebase-service-account.json`. Do not expose this to the client.
- Data Model: Per-user history at `users/{userId}/diagnosis` for text/image; general `queries` collection for audio transcription forwarding.

## Scripts
```bash
npm run dev      # start dev server
npm run build    # build (eslint ignored in build script as configured)
npm run start    # start production server
npm run lint     # run eslint
```


## Evaluation Mapping
- Correctness: Deterministic prompt structure, guarded inputs, typed routes
- LLM reasoning quality: Stepwise prompt, concise outputs, temperature tuned
- Safety disclaimers: Mandatory disclaimer in every answer
- Code design: Clear separation of API routes, auth, and persistence; typed TS; minimal coupling


## License
For educational use. Review third-party API terms (OpenAI, Clerk, Firebase) before production use.
