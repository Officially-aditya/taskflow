const TAVILY_API_URL = 'https://api.tavily.com/search';
const MIN_SCORE = 0.4; // filter out low-relevance results

/**
 * Search the web via Tavily and return a formatted context block for the LLM.
 *
 * @param {string} query - The search query
 * @param {object} options
 * @param {string} options.topic       - 'general' | 'news' | 'finance'  (default: 'general')
 * @param {string} options.time_range  - 'day' | 'week' | 'month' | 'year' (default: null)
 * @param {number} options.max_results - 1–20 (default: 6)
 */
export async function searchWeb(query, options = {}) {
  const apiKey = process.env.TAVILY_API;
  if (!apiKey) throw new Error('TAVILY_API is not defined in environment variables.');

  const {
    topic = 'general',
    time_range = null,
    max_results = 6,
  } = options;

  const body = {
    api_key: apiKey,
    query,
    search_depth: 'advanced',   // 'advanced' gives richer content vs 'basic'
    topic,
    max_results,
    include_answer: true,        // include AI-generated answer summary
    include_raw_content: false,
    include_images: false,
    include_favicon: false,
    include_usage: false,
    chunks_per_source: 3,       // max content chunks per result (advanced only)
  };

  if (time_range) body.time_range = time_range;

  const response = await fetch(TAVILY_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const err = await response.text().catch(() => '');
    throw new Error(`Tavily search failed: ${response.status}. ${err}`);
  }

  const data = await response.json();

  // Filter by relevance score, then sort best-first
  const results = (data.results ?? [])
    .filter(r => r.score >= MIN_SCORE)
    .sort((a, b) => b.score - a.score);

  if (results.length === 0 && !data.answer) return null;

  const snippets = results
    .map((r, i) => `[${i + 1}] ${r.title} (score: ${r.score.toFixed(2)})\n${r.content}\nSource: ${r.url}`)
    .join('\n\n');

  const answer = data.answer ? `Summary: ${data.answer}\n\n` : '';

  return `${answer}${snippets}`.trim();
}
