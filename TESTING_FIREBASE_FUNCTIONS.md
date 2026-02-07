# Testing Firebase Cloud Functions

## Prerequisites

- Functions deployed to Firebase
- `GEMINI_API_KEY` set in Firebase Functions config

## Quick Health Check

Test that the functions are running:

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

## Test Skin Analysis (Without Photo)

```bash
curl -X POST https://us-central1-drbn1-40b01.cloudfunctions.net/skinAnalysis \
  -H "Content-Type: application/json" \
  -d '{
    "profile": {
      "skinType": "combination",
      "concerns": ["hyperpigmentation", "acne"],
      "ageRange": "25-34",
      "sunExposure": "moderate",
      "currentRoutine": "basic"
    },
    "language": "en"
  }'
```

Expected response structure:
```json
{
  "skinType": "combination",
  "concerns": ["hyperpigmentation", "acne"],
  "overallScore": 75,
  "summary": "Your skin shows...",
  "recommendations": [
    {
      "title": "Use Vitamin C Serum",
      "description": "...",
      "priority": "high"
    }
  ],
  "morningRoutine": [
    {
      "step": 1,
      "product": "Gentle Cleanser",
      "instructions": "...",
      "timing": "2 minutes"
    }
  ],
  "eveningRoutine": [...],
  "ingredients": [...]
}
```

## Test Skin Analysis (With Photo)

First, convert an image to base64:

**Using PowerShell:**
```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("path\to\image.jpg")) | Set-Content base64.txt
```

**Using Node.js:**
```javascript
const fs = require('fs');
const imageBuffer = fs.readFileSync('image.jpg');
const base64 = imageBuffer.toString('base64');
const dataUrl = `data:image/jpeg;base64,${base64}`;
console.log(dataUrl);
```

Then test with photo:

```bash
curl -X POST https://us-central1-drbn1-40b01.cloudfunctions.net/skinAnalysis \
  -H "Content-Type: application/json" \
  -d '{
    "profile": {
      "skinType": "combination",
      "concerns": ["hyperpigmentation"],
      "ageRange": "25-34",
      "sunExposure": "moderate",
      "currentRoutine": "basic",
      "photoData": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
    },
    "language": "en"
  }'
```

## Test from Frontend (Browser Console)

Open your deployed app and run in browser console:

```javascript
// Test health check
fetch('https://us-central1-drbn1-40b01.cloudfunctions.net/health')
  .then(r => r.json())
  .then(console.log);

// Test skin analysis
fetch('https://us-central1-drbn1-40b01.cloudfunctions.net/skinAnalysis', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    profile: {
      skinType: 'combination',
      concerns: ['hyperpigmentation'],
      ageRange: '25-34',
      sunExposure: 'moderate',
      currentRoutine: 'basic'
    },
    language: 'en'
  })
})
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);
```

## Common Errors

### CORS Error
**Symptom:** `Access-Control-Allow-Origin` error in browser console

**Solution:** Check that your origin is in the allowed list in `functions/src/index.ts`:
- `https://drbn1-40b01.web.app`
- `https://drbn1-40b01.firebaseapp.com`
- `http://localhost:5173`

### "Missing GEMINI_API_KEY"
**Symptom:** 500 error with message about missing API key

**Solution:** Set the environment variable:
```bash
npx -y firebase-tools functions:secrets:set GEMINI_API_KEY
```
Enter your key when prompted, then redeploy.

### "Invalid AI response format"
**Symptom:** 502 error about invalid response

**Solution:** The AI returned text instead of JSON. Check Firebase Function logs:
```bash
firebase functions:log
```

### Request Timeout
**Symptom:** Request takes >60 seconds and times out

**Solution:** Image might be too large. The function has an 8MB limit on base64 data. Compress the image before sending.

## Deployment Logs

View real-time logs:
```bash
firebase functions:log --only skinAnalysis
```

Or in Firebase Console:
https://console.firebase.google.com/project/drbn1-40b01/functions/logs

## Performance Tips

1. **Image Size:** Keep photos under 3MB before base64 encoding
2. **Caching:** Consider caching results by profile hash
3. **Timeout:** Current timeout is 60s - sufficient for most requests
4. **Memory:** Function allocated 512MB - enough for vision tasks
