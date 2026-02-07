# Final Deployment Guide - AI Integration

## What Changed

The app now uses **Firebase Cloud Functions** instead of Supabase Edge Functions for AI generation. This provides:
- Better CORS control
- Structured JSON responses
- Proper error handling
- Support for both photo and text-only analysis

## Files Modified

### Backend (Firebase Functions)
1. **`functions/src/index.ts`** - Updated:
   - Added proper CORS whitelist for Firebase Hosting domains
   - Created `skinAnalysis` endpoint (main endpoint for frontend)
   - Kept `analyzePhoto` endpoint (legacy/simple use)
   - Added `health` endpoint for monitoring
   - Lazy-loads Gemini client to avoid deploy timeouts

### Frontend
1. **`src/lib/firebaseFunctions.ts`** - NEW:
   - Client library for calling Firebase Cloud Functions
   - Type-safe request/response interfaces
   - Error handling and validation

2. **`src/pages/TodayPlan.tsx`** - Updated:
   - Replaced Supabase calls with Firebase Function calls
   - Uses new `generateSkinAnalysis()` helper
   - Better error messages shown to user

### Configuration
1. **`.env`** - Added:
   - `VITE_FIREBASE_FUNCTIONS_URL` - Base URL for functions

2. **`.env.example`** - NEW:
   - Template for environment variables

## Deployment Steps

### Step 1: Install Function Dependencies

```bash
cd functions
npm install
cd ..
```

### Step 2: Set Gemini API Key in Firebase

**IMPORTANT:** Use Firebase secrets (not the old runtime config):

```bash
npx -y firebase-tools functions:secrets:set GEMINI_API_KEY
```

When prompted, enter your Gemini API key:
```
AIzaSyABJvARwL82gJKHxkKsYXSbr0WfSIBA19s
```

Press Enter to confirm.

### Step 3: Deploy Functions

```bash
npx -y firebase-tools deploy --only functions
```

Expected output:
```
✔  Deploy complete!

Functions:
  - health(us-central1): https://us-central1-drbn1-40b01.cloudfunctions.net/health
  - skinAnalysis(us-central1): https://us-central1-drbn1-40b01.cloudfunctions.net/skinAnalysis
  - analyzePhoto(us-central1): https://us-central1-drbn1-40b01.cloudfunctions.net/analyzePhoto
```

### Step 4: Test Functions (IMPORTANT!)

Before deploying the frontend, verify functions work:

```bash
curl https://us-central1-drbn1-40b01.cloudfunctions.net/health
```

Should return:
```json
{"ok":true,"service":"drbn-functions","time":"2026-02-06T..."}
```

If you get an error, check:
- Firebase Functions logs: `firebase functions:log`
- API key is set: `firebase functions:secrets:access GEMINI_API_KEY`

### Step 5: Build Frontend

```bash
npm run build
```

This compiles the React app with the new Firebase Function integration.

### Step 6: Deploy Frontend to Firebase Hosting

```bash
npx -y firebase-tools deploy --only hosting
```

Your app will be live at:
- `https://drbn1-40b01.web.app`
- `https://drbn1-40b01.firebaseapp.com`

## Post-Deployment Testing

### 1. Open your deployed app
Navigate to: `https://drbn1-40b01.web.app`

### 2. Complete the onboarding flow
- Click "Continue as guest" (or login if you have an account)
- Fill out the questionnaire
- Submit your profile

### 3. Test plan generation WITHOUT photos
- Click "Generate Plan (No Photos)"
- Wait ~10-20 seconds
- Verify you see a personalized skincare routine

### 4. Test plan generation WITH photos
- Click "Add Photos for Deeper Analysis"
- Take or upload a selfie
- Click "Generate Plan"
- Wait ~15-30 seconds
- Verify you see an AI-analyzed routine

### 5. Check for errors
Open browser DevTools (F12) → Console tab:
- Should see NO red errors
- Network tab should show successful POST to `skinAnalysis`

## Troubleshooting

### Error: "Failed to generate plan"

**Check 1:** Functions deployed?
```bash
firebase functions:list
```

**Check 2:** API key set?
```bash
firebase functions:secrets:access GEMINI_API_KEY
```

**Check 3:** Check function logs:
```bash
firebase functions:log --only skinAnalysis
```

### Error: CORS blocked

**Symptom:** Browser console shows `Access-Control-Allow-Origin` error

**Solution:** Your domain isn't whitelisted. Check `functions/src/index.ts` line 8-13:
```typescript
const allowedOrigins = [
  "https://drbn1-40b01.web.app",
  "https://drbn1-40b01.firebaseapp.com",
  "http://localhost:5173",
];
```

Add your domain if different, then redeploy functions.

### Error: "Missing GEMINI_API_KEY"

**Solution:** Re-run:
```bash
npx -y firebase-tools functions:secrets:set GEMINI_API_KEY
npx -y firebase-tools deploy --only functions
```

### Error: Function timeout

**Symptom:** Request takes >60 seconds

**Solution:** Image too large. The function has 8MB base64 limit. Try:
1. Compress image before upload
2. Or increase timeout in `functions/src/index.ts` line 89: `timeoutSeconds: 120`

## Rollback (if needed)

If something breaks, you can rollback functions:

```bash
firebase functions:rollback
```

Then check logs to see what went wrong:
```bash
firebase functions:log
```

## Security Checklist

✅ **API Key Security:**
- ✅ Gemini API key stored in Firebase Secrets (not in code)
- ✅ Frontend does NOT have API key
- ⚠️ **IMPORTANT:** The API key shown in this conversation was exposed. After successful deployment, regenerate it:
  1. Go to: https://console.cloud.google.com/apis/credentials
  2. Delete key: `AIzaSyABJvARwL82gJKHxkKsYXSbr0WfSIBA19s`
  3. Create new key
  4. Update Firebase: `npx -y firebase-tools functions:secrets:set GEMINI_API_KEY`
  5. Redeploy: `npx -y firebase-tools deploy --only functions`

✅ **CORS:**
- ✅ Restricted to Firebase Hosting domains + localhost
- ✅ Only allows POST and OPTIONS methods
- ✅ Only allows Content-Type header

✅ **Input Validation:**
- ✅ Image size limited to 8MB base64
- ✅ POST-only for data endpoints
- ✅ Content-Type validation

## Performance Monitoring

Monitor usage in Firebase Console:
- **Functions:** https://console.firebase.google.com/project/drbn1-40b01/functions
- **Logs:** https://console.firebase.google.com/project/drbn1-40b01/functions/logs
- **Usage:** https://console.firebase.google.com/project/drbn1-40b01/usage

## Cost Estimates

**Firebase Functions:**
- First 2M invocations/month: FREE
- After that: $0.40 per million invocations

**Gemini API:**
- Check pricing: https://ai.google.dev/pricing
- gemini-1.5-flash is cheapest option (currently used)

**Typical usage:**
- 1 user × 1 plan generation = 1 function call
- If 1000 users generate plans monthly = 1000 calls (well within free tier)

## Next Steps

1. ✅ Deploy functions
2. ✅ Test endpoints
3. ✅ Deploy frontend
4. ✅ Test end-to-end flow
5. ⚠️ **Regenerate API key** (security!)
6. 📊 Monitor usage and errors for first week
7. 🎉 Done!

## Support

- Firebase Functions Docs: https://firebase.google.com/docs/functions
- Gemini API Docs: https://ai.google.dev/docs
- Firebase Console: https://console.firebase.google.com/project/drbn1-40b01

---

**Deployment Date:** 2026-02-06
**Integration:** Firebase Cloud Functions + Gemini 1.5 Flash
**Status:** Ready for production deployment
