export default async function handler(req, res) {
  const keys = [
    process.env.GROQ_API_KEY,
    process.env.GROQ_API_KEY_2,
    process.env.GROQ_API_KEY_3
  ].filter(Boolean);

  const results = [];
  
  for (const key of keys) {
    try {
      const response = await fetch("https://api.groq.com/openai/v1/models", {
        headers: { "Authorization": "Bearer " + key }
      });
      const data = await response.json();
      results.push({
        key: key.substring(0, 10) + "...",
        status: response.status,
        valid: response.status === 200,
        models: response.status === 200 ? data.data?.map(m => m.id).slice(0, 5) : null,
        error: response.status !== 200 ? data : null
      });
    } catch (e) {
      results.push({
        key: key.substring(0, 10) + "...",
        error: e.message
      });
    }
  }

  res.status(200).json({
    totalKeys: keys.length,
    results: results
  });
}