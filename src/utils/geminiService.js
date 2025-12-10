/**
 * Get a short AI suggestion for an idea via Netlify Functions
 * @param {string} ideaTitle - The idea title to get suggestions for
 * @returns {Promise<string>} A short AI-generated suggestion
 */
export async function getSuggestion(ideaTitle) {
  if (!ideaTitle || ideaTitle.trim().length === 0) {
    throw new Error('Please enter an idea first');
  }

  try {
    // Call the Netlify Function
    // Note: In local development with 'vite', this needs a proxy or 'netlify dev'.
    // In production, this path works automatically.
    const response = await fetch('/.netlify/functions/suggestion', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ idea: ideaTitle }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Server error: ${response.status}`);
    }

    const data = await response.json();
    return data.suggestion;
  } catch (error) {
    console.error('AI Service Error:', error);
    throw error;
  }
}
