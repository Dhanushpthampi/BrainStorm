// Netlify serverless function for AI suggestions
export const handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { currentIdea, currentDescription, allIdeas } = JSON.parse(event.body);

    // Build context from all existing ideas
    const ideasContext = allIdeas && allIdeas.length > 0
      ? allIdeas.map(idea => `- ${idea.title}`).slice(0, 5).join('\n')
      : 'No existing ideas yet.';

    const prompt = `Idea: "${currentIdea}"

Context: ${ideasContext}

Give 1 short, innovative suggestion (max 2-3 lines) on how to make this idea unique or better. Be creative and actionable. Don't explain what you're doing, just give the suggestion directly.`;

    // Call Google Gemini API (much better free tier!)
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.9,
            maxOutputTokens: 150,
            topP: 0.95,
          }
        })
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Gemini API error:', errorData);
      
      // Handle rate limit
      if (response.status === 429) {
        return {
          statusCode: 429,
          body: JSON.stringify({ 
            error: 'Rate limit reached',
            message: 'Too many requests. Please try again in a moment.'
          })
        };
      }
      
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Gemini API Response:', JSON.stringify(data, null, 2));
    
    const suggestion = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Unable to generate suggestion at this time.';
    console.log('Extracted suggestion:', suggestion);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ suggestion })
    };
  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Failed to generate suggestion',
        message: error.message 
      })
    };
  }
};
