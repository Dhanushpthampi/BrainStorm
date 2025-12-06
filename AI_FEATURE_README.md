# AI Suggestion Feature Setup

## Overview
The Athena.ai suggestion feature uses OpenRouter API to provide intelligent suggestions for your ideas based on the context of all your existing ideas.

## How It Works
1. User types an idea title
2. Clicks "✨ Athena.ai suggest"
3. The system sends the current idea + all existing ideas to OpenRouter AI
4. AI analyzes the context and provides creative suggestions
5. Suggestions appear in a purple box with options to accept or modify

## Local Development

### 1. Environment Setup
Create a `.env` file in the root directory:
```
OPENROUTER_API_KEY=your-api-key-here
```

### 2. Run with Netlify Dev
```bash
netlify dev
```

This will:
- Start Vite dev server on port 5173
- Run Netlify Functions locally
- Properly route API calls to `/.netlify/functions/*`

### 3. Testing
- Navigate to http://localhost:8888 (Netlify Dev URL)
- Add a new idea
- Click "✨ Athena.ai suggest"
- You should see AI-generated suggestions

## Deployment to Netlify

### 1. Add Environment Variable
In your Netlify dashboard:
1. Go to Site settings → Environment variables
2. Add: `OPENROUTER_API_KEY` = `your-key-here`

### 2. Deploy
```bash
npm run build
# Then push to Git - Netlify will auto-deploy
```

### 3. Verify
- Visit your deployed site
- Test the AI suggestion feature

## Security Notes
- ✅ API key is stored in environment variables (never in frontend code)
- ✅ Netlify Functions act as a proxy to keep the key secure
- ✅ `.env` is in `.gitignore` (never committed to Git)

## API Model
Currently using: `meta-llama/llama-3.2-3b-instruct:free` (free tier)

You can change the model in `netlify-functions/ai-suggest.js`:
```javascript
model: 'meta-llama/llama-3.2-3b-instruct:free'
```

Other free models on OpenRouter:
- `google/gemma-2-9b-it:free`
- `meta-llama/llama-3.1-8b-instruct:free`
- `microsoft/phi-3-mini-128k-instruct:free`

## Troubleshooting

### "Failed to generate suggestion"
- Check that `.env` file exists in root
- Verify `OPENROUTER_API_KEY` is set correctly
- Check browser console for detailed errors

### Local testing not working
- Make sure you're using `netlify dev`, not `npm run dev`
- Netlify Dev URL is usually http://localhost:8888, not 5173

### Deployment not working
- Verify environment variable is set in Netlify dashboard
- Check Netlify Functions logs in dashboard
- Ensure `netlify.toml` is in the root directory
