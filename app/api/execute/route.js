import { callOxlo, callOxloText } from '@/lib/oxlo';
import { searchWeb } from '@/lib/tavily';

const REVIEW_THRESHOLD = 7.0;

function buildPersonalizationBlock(preferences) {
  if (!preferences || Object.keys(preferences).length === 0) return '';
  const lines = [];
  if (preferences.tone) lines.push(`Tone: ${preferences.tone}`);
  if (preferences.style) lines.push(`Writing style: ${preferences.style}`);
  if (preferences.audience) lines.push(`Target audience: ${preferences.audience}`);
  if (preferences.customInstructions) lines.push(`Additional instructions: ${preferences.customInstructions}`);
  if (lines.length === 0) return '';
  return `\n\nPersonalization preferences (follow these strictly):\n${lines.join('\n')}`;
}

const PLATFORM_INSTRUCTIONS = {
  LinkedIn: 'professional tone, 150–300 words, hook-first structure, no hashtag spam',
  'Twitter/X': 'numbered thread format (1/, 2/, 3/...), punchy, each tweet under 280 characters',
  Blog: 'long-form with H2/H3 headings (use markdown ## and ###), SEO-optimized, 500–800 words',
  Email: 'include a compelling subject line at the top labeled "Subject:", followed by the body with a clear CTA at the end',
};

// Strip common "Write a..." prefixes to extract the core topic for search
function extractSearchQuery(goal) {
  return goal
    .replace(/^(write|create|draft|make|generate)\s+(a|an|the|me\s+a|me\s+an)?\s*/i, '')
    .replace(/^(linkedin post|twitter thread|blog post|email|post|thread|article)\s+(about|on|for|regarding)?\s*/i, '')
    .trim();
}

export async function POST(req) {
  const { goal, platform, previousOutput, refinementNote, preferences } = await req.json();
  const isRefinement = Boolean(previousOutput && refinementNote);

  const encoder = new TextEncoder();
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();

  const send = async (event) => {
    await writer.write(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
  };

  (async () => {
    try {
      let apiCalls = 0;
      let researchContext = '';

      // ── Step 1: Research (skipped for refinements) ──────────────────────────
      if (!isRefinement) {
        await send({ type: 'step', step: 1, label: 'Researching topic', status: 'running' });
        try {
          const query = extractSearchQuery(goal);
          researchContext = await searchWeb(query || goal);
          await send({ type: 'step', step: 1, label: 'Research complete', status: 'done' });
        } catch (err) {
          // Research failure is non-fatal — continue without it
          console.warn('Research step failed, continuing without context:', err.message);
          await send({ type: 'step', step: 1, label: 'Research skipped', status: 'skipped' });
        }
      } else {
        await send({ type: 'step', step: 1, label: 'Research skipped (refinement)', status: 'skipped' });
      }

      // ── Step 2: Draft (or refine) ───────────────────────────────────────────
      let draft;
      const researchBlock = researchContext
        ? `\n\nWeb research to use as factual grounding (cite specific stats or examples where relevant):\n${researchContext}`
        : '';
      const personalizationBlock = buildPersonalizationBlock(preferences);

      if (isRefinement) {
        await send({ type: 'step', step: 2, label: 'Refining previous output', status: 'running' });
        apiCalls++;
        draft = await callOxloText(
          `You are a professional content writer refining an existing piece based on user feedback. Apply the changes while keeping what works. Target platform: ${platform}. Guidelines: ${PLATFORM_INSTRUCTIONS[platform]}. Return only the revised content, no commentary.${personalizationBlock}`,
          `Original content:\n${previousOutput}\n\nRefinement instructions:\n${refinementNote}`
        );
        await send({ type: 'step', step: 2, label: 'Refinement draft ready', status: 'done' });
      } else {
        await send({ type: 'step', step: 2, label: 'Drafting content', status: 'running' });
        apiCalls++;
        draft = await callOxloText(
          `You are a professional content writer. Write a high-quality draft for ${platform}. Follow these guidelines: ${PLATFORM_INSTRUCTIONS[platform]}. Use the web research provided to ground your writing in real facts, stats, and examples — do not make up statistics.${researchBlock ? '' : ' Return only the draft content, no commentary.'}${personalizationBlock}`,
          `Content goal: ${goal}${researchBlock}`
        );
        await send({ type: 'step', step: 2, label: 'Draft complete', status: 'done' });
      }

      // ── Step 3: Review ──────────────────────────────────────────────────────
      await send({ type: 'step', step: 3, label: 'Reviewing draft', status: 'running' });
      apiCalls++;
      const review = await callOxlo(
        `You are a content quality reviewer. Evaluate the draft for clarity, tone, engagement, factual grounding, and platform fit (${platform}). Return ONLY a valid JSON object: {"score": <number 0-10>, "notes": "<improvement suggestions>", "tone": "<one word>", "seo": "<Weak|Moderate|Strong>", "length": "<Too Short|Optimal|Too Long>"}`,
        `Draft:\n${draft}`
      );
      await send({ type: 'step', step: 3, label: `Review complete — Score: ${review.score}/10`, status: 'done', score: review.score });

      // ── Step 4: Rewrite (conditional) ───────────────────────────────────────
      let finalDraft = draft;
      let finalScore = review.score;

      if (review.score < REVIEW_THRESHOLD) {
        await send({ type: 'step', step: 4, label: 'Score below threshold, rewriting', status: 'running' });
        apiCalls++;
        const rewrite = await callOxloText(
          `You are a professional content rewriter. Rewrite the draft based on the review feedback to significantly improve quality. Target platform: ${platform}. Guidelines: ${PLATFORM_INSTRUCTIONS[platform]}. Return only the rewritten content, no commentary.${personalizationBlock}`,
          `Original draft:\n${draft}\n\nReview notes:\n${review.notes}${researchBlock}`
        );

        apiCalls++;
        const reReview = await callOxlo(
          `You are a content quality reviewer. Evaluate this rewritten draft for ${platform}. Return ONLY valid JSON: {"score": <number 0-10>, "notes": "<notes>", "tone": "<one word>", "seo": "<Weak|Moderate|Strong>", "length": "<Too Short|Optimal|Too Long>"}`,
          `Draft:\n${rewrite}`
        );
        finalDraft = rewrite;
        finalScore = reReview.score;
        Object.assign(review, reReview);
        await send({ type: 'step', step: 4, label: `Rewrite complete — Score: ${reReview.score}/10`, status: 'done', score: reReview.score });
      } else {
        await send({ type: 'step', step: 4, label: 'Rewrite not needed', status: 'skipped' });
      }

      // ── Step 5: Format for platform ─────────────────────────────────────────
      await send({ type: 'step', step: 5, label: `Formatting for ${platform}`, status: 'running' });
      apiCalls++;
      const formatted = await callOxloText(
        `You are a content formatter. Format the content perfectly for ${platform}. Strictly follow: ${PLATFORM_INSTRUCTIONS[platform]}. Return only the formatted content, no commentary.`,
        `Content:\n${finalDraft}`
      );
      await send({ type: 'step', step: 5, label: `Formatted for ${platform}`, status: 'done' });

      // ── Step 6: Final polish ─────────────────────────────────────────────────
      await send({ type: 'step', step: 6, label: 'Final polish pass', status: 'running' });
      apiCalls++;
      const polished = await callOxloText(
        `You are a final editor. Polish the content: fix grammar, improve flow, sharpen the hook, ensure publication-readiness. Return only the polished content, no commentary.`,
        `Content:\n${formatted}`
      );
      await send({ type: 'step', step: 6, label: 'Polish complete', status: 'done' });

      await send({
        type: 'result',
        output: polished,
        score: finalScore,
        tone: review.tone,
        seo: review.seo,
        length: review.length,
        platform,
        apiCalls,
        researched: Boolean(researchContext),
      });
    } catch (err) {
      console.error('Pipeline error:', err);
      await send({ type: 'error', message: err.message });
    } finally {
      await writer.close();
    }
  })();

  return new Response(stream.readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
