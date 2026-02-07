# Firebase Functions Deployment Guide

## Overview

This project includes Firebase Cloud Functions (v2) for AI-powered photo analysis using Google Gemini.

**Functions included:**
- `skinAnalysis` - POST endpoint for complete skincare analysis (with or without photos)
- `analyzePhoto` - POST endpoint for simple photo analysis (legacy)
- `health` - GET endpoint for health monitoring

**Firebase Project:** `drbn1-40b01`

---

## Prerequisites

1. Firebase CLI installed globally:
   ```bash
   npm install -g firebase-tools
   ```

2. Logged into Firebase:
   ```bash
   firebase login
   ```

3. Google Gemini API key from: https://console.cloud.google.com/apis/credentials

---

## Deployment Steps

### 1. Install Function Dependencies

Navigate to the functions directory and install dependencies:

```bash
cd functions
npm install
cd ..
```

### 2. Set Gemini API Key (Production)

**IMPORTANT:** The function now reads from `GEMINI_API_KEY` environment variable.

Set it using Firebase secrets:

```bash
npx -y firebase-tools functions:secrets:set GEMINI_API_KEY
```

When prompted, enter your Gemini API key (e.g., `AIzaSy...`).

**Alternative:** Set as environment variable in `.env` file in `functions/` directory for local development only.

### 3. Deploy Functions Only

Deploy only the functions (without redeploying hosting):

```bash
npx -y firebase-tools deploy --only functions
```

This will:
- Compile TypeScript to JavaScript
- Upload functions to Firebase
- Deploy `analyzePhoto` and `healthCheck` endpoints

### 4. Deploy Everything (Functions + Hosting)

To deploy both functions and hosting together:

```bash
npm run build
npx -y firebase-tools deploy
```

---

## Local Development

### Setup Local Environment

1. Create a `.env` file in the `functions/` directory:
   ```bash
   cd functions
   cp .env.example .env
   ```

2. Edit `.env` and add your Gemini API key:
   ```
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

### Run Functions Locally

```bash
cd functions
npm run serve
```

This starts the Firebase emulator. Your functions will be available at:
- `http://localhost:5001/drbn1-40b01/us-central1/analyzePhoto`
- `http://localhost:5001/drbn1-40b01/us-central1/healthCheck`

---

## Testing the Endpoints

### Health Check (GET)

```bash
curl https://us-central1-drbn1-40b01.cloudfunctions.net/health
```

Expected response:
```json
{
  "ok": true,
  "service": "drbn-functions",
  "time": "2026-02-06T..."
}
```

### Skin Analysis (POST) - Main Endpoint

This is the endpoint used by the frontend:

```bash
curl -X POST https://us-central1-drbn1-40b01.cloudfunctions.net/skinAnalysis \
  -H "Content-Type: application/json" \
  -d '{
    "profile": {
      "skinType": "combination",
      "concerns": ["hyperpigmentation", "acne"],
      "ageRange": "25-34",
      "sunExposure": "moderate",
      "currentRoutine": "basic",
      "photoData": "data:image/jpeg;base64,/9j/4AAQ..."
    },
    "language": "en"
  }'
```

Expected response:
```json
{
  "skinType": "combination",
  "concerns": ["hyperpigmentation", "acne"],
  "overallScore": 75,
  "summary": "Personalized analysis...",
  "recommendations": [...],
  "morningRoutine": [...],
  "eveningRoutine": [...],
  "ingredients": [...]
}
```

**Request format:**
- `profile` (required): Object containing skin profile data
  - `skinType`: User's skin type
  - `concerns`: Array of skin concerns
  - `ageRange`: Age range or specific age
  - `sunExposure`: Sun exposure level
  - `currentRoutine`: Current skincare routine complexity
  - `photoData` (optional): Base64-encoded photo for visual analysis
- `language` (optional): `"en"` or `"fr"` (defaults to `"en"`)

**Supported image formats:** JPEG, PNG, WebP
**Max image size:** 8MB base64 data

See [TESTING_FIREBASE_FUNCTIONS.md](TESTING_FIREBASE_FUNCTIONS.md) for detailed testing instructions.

---

## Troubleshooting

### Error: "GEMINI_API_KEY not configured"

Solution:
```bash
npx -y firebase-tools functions:config:set gemini.key="YOUR_KEY"
npx -y firebase-tools deploy --only functions
```

### Error: "Method not allowed"

The `analyzePhoto` endpoint only accepts POST requests. Make sure you're using POST, not GET.

### Error: "Invalid imageBase64 format"

Ensure your base64 string is valid and includes the proper format:
- With data URL: `data:image/jpeg;base64,/9j/4AAQ...`
- Or just the base64 data: `/9j/4AAQ...`

### View Function Logs

```bash
firebase functions:log
```

Or view in Firebase Console:
https://console.firebase.google.com/project/drbn1-40b01/functions/logs

---

## Cost Considerations

- **Firebase Functions:** First 2M invocations/month free
- **Gemini API:** Check current pricing at https://ai.google.dev/pricing
- **Networking:** Outbound data charged after free tier

Monitor usage in:
- Firebase Console: https://console.firebase.google.com/project/drbn1-40b01/usage
- Google Cloud Console: https://console.cloud.google.com/

---

## Security Notes

1. **API Key Security:**
   - Never commit `.env` files to git
   - Use Firebase config for production (`functions:config:set`)
   - Rotate keys if exposed

2. **CORS:**
   - Currently allows all origins (`origin: true`)
   - For production, restrict to your domain:
     ```typescript
     const corsHandler = cors({origin: 'https://yourdomain.com'});
     ```

3. **Rate Limiting:**
   - Consider adding rate limiting for production
   - Monitor Firebase Functions usage dashboard

---

## Quick Reference Commands

```bash
# Install dependencies
cd functions && npm install && cd ..

# Set API key
npx -y firebase-tools functions:config:set gemini.key="YOUR_KEY"

# Deploy functions only
npx -y firebase-tools deploy --only functions

# Deploy everything
npm run build && npx -y firebase-tools deploy

# View logs
firebase functions:log

# Test locally
cd functions && npm run serve
```

---

**Last Updated:** 2026-02-01
**Functions Runtime:** Node.js 20
**Region:** us-central1 (default)
