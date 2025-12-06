# 🚀 Quick Setup: Google Gemini API (FREE!)

## Why Switch to Gemini?
- ✅ **1,500 requests per day** (vs 10-20 on OpenRouter free tier)
- ✅ **Fast and reliable**
- ✅ **No credit card required**
- ✅ **Completely free**

## Setup Steps (2 minutes)

### 1. Get Your FREE API Key
1. Go to: https://aistudio.google.com/app/apikey
2. Click "Create API Key"
3. Copy the key (starts with `AIza...`)

### 2. Update Your .env File
Open `.env` in the root directory and replace it with:

```
GEMINI_API_KEY=AIzaSy... (paste your key here)
```

### 3. Restart Netlify Dev
Stop the current server (Ctrl+C) and restart:

```bash
npx netlify dev
```

### 4. Test It!
1. Go to http://localhost:8888
2. Add a new idea
3. Click "✨ Athena.ai suggest"
4. Get instant, creative suggestions!

## For Netlify Deployment

Add the environment variable in Netlify Dashboard:
1. Go to: Site settings → Environment variables
2. Add: `GEMINI_API_KEY` = `AIzaSy...` (your key)
3. Redeploy

## What Changed?
- ❌ Removed: OpenRouter API (low free limits)
- ✅ Added: Google Gemini API (1,500 free requests/day)
- Same short, creative suggestions (2-3 lines)
- Much more reliable!

Enjoy unlimited AI suggestions! 🎉
