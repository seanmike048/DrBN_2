# 🚀 DEPLOY NOW - Quick Reference

## Prerequisites
- Firebase CLI installed: `npm install -g firebase-tools`
- Logged in: `firebase login`
- Gemini API key ready

---

## 📋 Deployment Commands (Copy-Paste)

```bash
# 1. Install function dependencies
cd functions
npm install
cd ..

# 2. Set Gemini API key
npx -y firebase-tools functions:secrets:set GEMINI_API_KEY
# When prompted, enter: AIzaSyABJvARwL82gJKHxkKsYXSbr0WfSIBA19s

# 3. Deploy functions
npx -y firebase-tools deploy --only functions

# 4. Test functions work
curl https://us-central1-drbn1-40b01.cloudfunctions.net/health

# 5. Build frontend
npm run build

# 6. Deploy frontend
npx -y firebase-tools deploy --only hosting
```

---

## ✅ Test After Deployment

1. Open: `https://drbn1-40b01.web.app`
2. Click "Continue as guest"
3. Fill questionnaire
4. Click "Generate Plan (No Photos)"
5. Wait ~10 seconds → Routine should appear ✅

---

## ⚠️ IMPORTANT: Regenerate API Key

**After deployment works, regenerate the exposed API key:**

1. Go to: https://console.cloud.google.com/apis/credentials
2. Delete old key: `AIzaSyABJvARwL82gJKHxkKsYXSbr0WfSIBA19s`
3. Create new key
4. Update:
   ```bash
   npx -y firebase-tools functions:secrets:set GEMINI_API_KEY
   npx -y firebase-tools deploy --only functions
   ```

---

## 🆘 If Something Breaks

**Check logs:**
```bash
firebase functions:log --only skinAnalysis
```

**Rollback:**
```bash
firebase functions:rollback
```

**Test endpoint directly:**
```bash
curl -X POST https://us-central1-drbn1-40b01.cloudfunctions.net/skinAnalysis \
  -H "Content-Type: application/json" \
  -d '{"profile":{"skinType":"combination","concerns":["acne"],"ageRange":"25","sunExposure":"moderate","currentRoutine":"basic"},"language":"en"}'
```

---

## 📚 Detailed Docs

- Full guide: [DEPLOYMENT_FINAL.md](DEPLOYMENT_FINAL.md)
- Testing: [TESTING_FIREBASE_FUNCTIONS.md](TESTING_FIREBASE_FUNCTIONS.md)
- Summary: [AI_INTEGRATION_SUMMARY.md](AI_INTEGRATION_SUMMARY.md)

---

**That's it! Deploy now and test. Good luck! 🎉**
