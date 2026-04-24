function parseExplanationJson(content) {
  if (!content || typeof content !== 'string') {
    throw new Error('Empty model response');
  }
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('No valid JSON in model response');
  }
  const parsed = JSON.parse(jsonMatch[0]);
  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Invalid JSON structure');
  }
  if (!parsed.title || typeof parsed.title !== 'string') {
    throw new Error('Missing title in model response');
  }
  if (!Array.isArray(parsed.steps)) {
    throw new Error('Missing steps array in model response');
  }
  const steps = parsed.steps.slice(0, 5).map((step, index) => ({
    id: typeof step.id === 'number' ? step.id : index + 1,
    heading: String(step.heading || `Step ${index + 1}`),
    description: String(step.description || ''),
    interactionType: String(step.interactionType || 'text'),
    content: step.content && typeof step.content === 'object' ? step.content : { mainText: '' },
  }));
  return {
    title: parsed.title,
    description: typeof parsed.description === 'string' ? parsed.description : '',
    steps,
  };
}

async function generateExplanation(topic) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const baseUrl = process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1';
  const model = process.env.OPENROUTER_MODEL || 'google/gemma-3n-e4b-it:free';
  const referer = process.env.OPENROUTER_HTTP_REFERER || 'http://localhost:5173';
  const title = process.env.OPENROUTER_APP_TITLE || 'Stepify';

  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY is not configured');
  }

  const prompt = `You are an expert educational AI. Generate an interactive step-by-step explanation for: "${topic}"

Return ONLY valid JSON (no markdown fences, no explanations outside JSON):
{
  "title": "Clear, concise title",
  "description": "Brief 1-2 line description",
  "steps": [
    {
      "id": 1,
      "heading": "Step title",
      "description": "Explanation text (max 100 words)",
      "interactionType": "text | button_demo | slider | animation | comparison",
      "content": {
        "mainText": "Explanation",
        "buttonLabel": "Optional",
        "sliderMin": 0,
        "sliderMax": 100,
        "animationDescription": "What happens"
      }
    }
  ]
}

Rules:
- Max 5 steps.
- Each step under 100 words.
- Use simple, clear language.
- Include at least one step where interactionType is not "text" (e.g. button_demo or slider).
- interactionType must be one of: text, button_demo, slider, animation, comparison.`;

  const url = `${baseUrl.replace(/\/$/, '')}/chat/completions`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 90000);

  let response;
  try {
    response = await fetch(url, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'HTTP-Referer': referer,
        'X-Title': title,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });
  } finally {
    clearTimeout(timeout);
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const msg = data?.error?.message || data?.message || `OpenRouter error (${response.status})`;
    const err = new Error(msg);
    err.status = 502;
    throw err;
  }

  const content = data?.choices?.[0]?.message?.content;
  try {
    return parseExplanationJson(content);
  } catch (e) {
    const err = new Error(e.message || 'Failed to parse model output');
    err.status = 502;
    throw err;
  }
}

module.exports = {
  generateExplanation,
  parseExplanationJson,
};
