✅ DEPLOYMENT CHECKLIST
========================

Before you deploy, make sure you:

□ 1. Add GEMINI_API_KEY to Netlify Environment Variables
   - Go to: Netlify Dashboard → Site Settings → Environment Variables
   - Add: GEMINI_API_KEY = AIzaSy... (your key)
   - Get key from: https://aistudio.google.com/app/apikey

□ 2. Commit and push the code changes
   git add .
   git commit -m "Fix browser crash and AI suggest feature"
   git push

□ 3. Wait for Netlify to build and deploy

□ 4. Test on deployed site:
   - Add a new idea (page should work without crashing)
   - Click "✨ Athena.ai suggest" (should get AI suggestions)

That's it! Your app should now work perfectly in production! 🎉
