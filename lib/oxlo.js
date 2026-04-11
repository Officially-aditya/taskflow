export async function callOxlo(systemPrompt, userPrompt) {
  const apiKey = process.env.OXLO_API || process.env.OXLO_API_KEY;
  if (!apiKey) {
    throw new Error('OXLO_API is not defined in environment variables.');
  }

  const response = await fetch('https://api.oxlo.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'deepseek-v3-0324',
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

  const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (jsonMatch) content = jsonMatch[1];

  return JSON.parse(content);
}

export async function callOxloText(systemPrompt, userPrompt) {
  const apiKey = process.env.OXLO_API || process.env.OXLO_API_KEY;
  if (!apiKey) {
    throw new Error('OXLO_API is not defined in environment variables.');
  }

  const response = await fetch('https://api.oxlo.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'deepseek-v3-0324',
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
  return data.choices[0].message.content.trim();
}
