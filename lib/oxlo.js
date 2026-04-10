export async function callOxlo(systemPrompt, userPrompt) {
  const apiKey = process.env.OXLO_API || process.env.OXLO_API_KEY;
  if (!apiKey) {
    throw new Error('OXLO_API is not defined in environment variables.');
  }

  try {
    const response = await fetch('https://api.oxlo.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-v3-0324', // Working model ID
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      throw new Error(`API call failed with status: ${response.status}. ${errorText}`);
    }

    const data = await response.json();
    let content = data.choices[0].message.content;
    
    // Check if the response is wrapped in standard markdown json code fences
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      content = jsonMatch[1];
    }
    
    return JSON.parse(content);
  } catch (error) {
    console.error('Oxlo API Error:', error);
    throw error;
  }
}
