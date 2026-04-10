export async function callOxlo(systemPrompt, userPrompt) {
  const apiKey = process.env.OXLO_API_KEY;
  if (!apiKey) {
    throw new Error('OXLO_API_KEY is not defined in environment variables.');
  }

  try {
    const response = await fetch('https://api.oxlo.io/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'oxlo-model-v1', // Replace with the actual model name
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        response_format: { type: "json_object" } // Using json object for structured response
      })
    });

    if (!response.ok) {
      throw new Error(`API call failed with status: ${response.status}`);
    }

    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
  } catch (error) {
    console.error('Oxlo API Error:', error);
    throw error;
  }
}
