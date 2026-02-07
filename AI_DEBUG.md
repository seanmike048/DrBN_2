# AI Integration Debug Guide

## Backend Endpoints

Base URL: `https://us-central1-drbn1-40b01.cloudfunctions.net`

### 1. Health Check

```bash
curl -s https://us-central1-drbn1-40b01.cloudfunctions.net/health | jq .
```

Expected response:
```json
{
  "ok": true,
  "service": "drbn-functions",
  "time": "2025-01-01T00:00:00.000Z"
}
```

### 2. Analyze Photo

```bash
# Using a tiny 1x1 red pixel JPEG as test (replace with real base64 for real test)
curl -s -X POST \
  https://us-central1-drbn1-40b01.cloudfunctions.net/analyzePhoto \
  -H "Content-Type: application/json" \
  -d '{
    "imageBase64": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFAABAAAAAAAAAAAAAAAAAAAACf/EABQQAQAAAAAAAAAAAAAAAAAAAAD/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8AKwA//9k=",
    "prompt": "Describe what you see in this test image.",
    "lang": "en"
  }' | jq .
```

Expected response:
```json
{
  "ok": true,
  "analysisText": "... AI-generated analysis text ..."
}
```

### 3. Skin Analysis (Plan Generation)

```bash
curl -s -X POST \
  https://us-central1-drbn1-40b01.cloudfunctions.net/skinAnalysis \
  -H "Content-Type: application/json" \
  -d '{
    "profile": {
      "skinType": "combination",
      "concerns": ["hyperpigmentation", "dryness"],
      "ageRange": "25-34",
      "sunExposure": "moderate",
      "currentRoutine": "basic"
    },
    "language": "en"
  }' | jq .
```

Expected response (structured JSON):
```json
{
  "skinType": "combination",
  "concerns": ["hyperpigmentation", "dryness"],
  "overallScore": 72,
  "summary": "...",
  "recommendations": [...],
  "morningRoutine": [...],
  "eveningRoutine": [...],
  "ingredients": [...]
}
```

## CORS Configuration

Allowed origins:
- `https://drbn1-40b01.web.app`
- `https://drbn1-40b01.firebaseapp.com`
- `http://localhost:5173`
- `http://localhost:5174`

Preflight (OPTIONS) returns `204 No Content` immediately.

## Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| `CORS error` in console | Origin not in allowlist | Check `allowedOrigins` in `functions/src/index.ts` |
| `413 Payload Too Large` | Image > 8MB | Reduce photo quality / resolution |
| `502 Empty response from AI` | Gemini returned nothing | Check `GEMINI_API_KEY` is set, check Gemini API quotas |
| `Missing GEMINI_API_KEY` | Env var not set | Create `functions/.env` with `GEMINI_API_KEY=...` and redeploy |
| `405 Method not allowed` | Using GET instead of POST | Use POST with `Content-Type: application/json` |

## End-to-End Test Checklist

- [ ] Open app at `https://drbn1-40b01.web.app`
- [ ] Enter guest mode (skip login)
- [ ] Complete onboarding questionnaire (skin type, concerns, etc.)
- [ ] Navigate to "Today's Plan" page
- [ ] Click "Generate Plan (No Photos)" — see loading spinner → plan appears
- [ ] Verify browser Network tab shows request to `cloudfunctions.net/skinAnalysis`
- [ ] Verify response contains `skinType`, `summary`, `morningRoutine`, `eveningRoutine`
- [ ] Click "Add Photos for Deeper Analysis" — capture/upload a photo
- [ ] After photo completion, see loading spinner → plan generated with photo data
- [ ] Navigate to Evolution page → create check-in with photos
- [ ] Verify Network tab shows request to `cloudfunctions.net/skinAnalysis` (check-in analysis)
- [ ] Verify response contains `overallScore` and `summary`
- [ ] Check console logs: all `[AI]` prefixed logs show successful calls

## Deploy Commands

```bash
# Deploy functions
cd functions
npm install
npm run build
cd ..
npx -y firebase-tools deploy --only functions

# Deploy hosting
npm run build
npx -y firebase-tools deploy --only hosting
```

## Environment Setup

For the Cloud Functions to work, `GEMINI_API_KEY` must be set:

### Option A: `.env` file (auto-loaded by Firebase Functions v2)
```bash
# functions/.env (NOT committed to git)
GEMINI_API_KEY=your_key_here
```

### Option B: Firebase secrets (recommended for production)
```bash
firebase functions:secrets:set GEMINI_API_KEY
```

Then update `functions/src/index.ts` to use `defineSecret` from `firebase-functions/params`.
