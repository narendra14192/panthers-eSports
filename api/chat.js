/**
 * Panthers Esports — NVIDIA NIM AI Proxy
 * Vercel Serverless Function: /api/chat
 *
 * Proxies chat requests to NVIDIA NIM API server-side,
 * keeping the API key secure and resolving browser CORS issues.
 */

const NVIDIA_BASE_URL = 'https://integrate.api.nvidia.com/v1';
const NVIDIA_MODEL = 'nvidia/llama-3.1-nemotron-ultra-253b-v1';

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // CORS headers for local dev and deployed
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const apiKey = process.env.NVIDIA_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'NVIDIA API key not configured on server' });
  }

  const { messages, temperature = 0.6, max_tokens = 400 } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Invalid request: messages array required' });
  }

  try {
    const response = await fetch(`${NVIDIA_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: NVIDIA_MODEL,
        messages,
        temperature,
        max_tokens,
        top_p: 0.95,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[NVIDIA API Error] ${response.status}: ${errorText}`);
      return res.status(response.status).json({
        error: `NVIDIA API error: ${response.status}`,
        details: errorText,
      });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (err) {
    console.error('[NVIDIA Proxy Error]', err);
    return res.status(500).json({ error: 'Failed to reach NVIDIA API', details: err.message });
  }
}
