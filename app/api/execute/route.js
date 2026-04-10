import { NextResponse } from 'next/server';
import { callOxlo } from '@/lib/oxlo';

export async function POST(req) {
  const startTime = Date.now();
  let apiCalls = 0;

  try {
    const { prompt } = await req.json();

    // Step 1: Intent Detection
    apiCalls++;
    const intentPrompt = `Analyze the following user prompt and classify their intent. Also extract any important entities. Return ONLY a valid JSON object matching the format: {"intent": "plan_day | learn_skill | research_topic | other", "entities": ["entity1", "entity2"]}`;
    const intentResponse = await callOxlo(intentPrompt, prompt);
    let intentData = intentResponse;

    // Step 2: Task Planning
    apiCalls++;
    const planningPrompt = `Given the intent "${intentData.intent}" and entities ${JSON.stringify(intentData.entities)}, generate a list of executable steps to fulfill this request. Return ONLY a valid JSON object matching the format: {"tasks": ["step 1", "step 2", "step 3"]}`;
    const planningResponse = await callOxlo(planningPrompt, prompt);
    let planningData = planningResponse;

    // Step 3: Execution
    apiCalls++;
    const executionPrompt = `Execute the following tasks: ${JSON.stringify(planningData.tasks)}. Given the user's original prompt: "${prompt}". Return ONLY a valid JSON object with the final output matching the format: {"title": "Summary Title", "sections": [{"heading": "Section Heading", "content": ["point 1", "point 2"]}]}`;
    const executionResponse = await callOxlo(executionPrompt, prompt);
    let executionData = executionResponse;

    const endTime = Date.now();
    const executionTimeSec = ((endTime - startTime) / 1000).toFixed(2);

    return NextResponse.json({
      steps: [
        "Understanding intent...",
        "Planning tasks...",
        "Generating output..."
      ],
      result: executionData,
      meta: {
        api_calls: apiCalls,
        execution_time: `${executionTimeSec} sec`
      }
    });

  } catch (error) {
    console.error('Execute API Error:', error);
    return NextResponse.json({ message: "Failed to execute pipeline", error: error.message }, { status: 500 });
  }
}
