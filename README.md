# TaskFlow AI

An autonomous content pipeline agent that takes a content goal and target platform, runs it through a self-correcting 6-step pipeline with live web research, and delivers a polished, publication-ready output — streamed in real time.

Built for the OxBuild Hackathon.

**Demo video:** https://youtu.be/d3oCRnzpJvM
**Live demo:** https://taskflow-tawny-omega.vercel.app
**Registered Oxlo email:** adityakumaryadav74@gmail.com

---

## What It Does

Give it a goal like _"Write a LinkedIn post about why Indian startups should adopt AI early"_ and a platform. It handles everything else:

1. **Research** — searches the web via Tavily, filters and ranks results, builds a factual grounding block
2. **Draft** — writes a full first draft grounded in real stats and examples
3. **Review** — scores the draft out of 10 and returns structured quality metadata
4. **Rewrite** _(conditional)_ — if score < 7.0, rewrites from scratch using the review notes, then re-scores
5. **Format** — applies strict platform-specific formatting rules
6. **Polish** — final grammar, flow, and hook pass before delivery

Every step streams back to the UI in real time. The pipeline is fully autonomous — no human input between steps.

---

## Architecture

```
Browser (page.js)
    │
    │  POST /api/execute  { goal, platform, preferences, previousOutput?, refinementNote? }
    ▼
Route Handler (app/api/execute/route.js)
    │  ← SSE stream: data: { type: 'step' | 'result' | 'error', ... }
    │
    ├── Step 1: searchWeb() → Tavily REST API
    ├── Step 2: callOxloText() → Draft
    ├── Step 3: callOxlo() → Review JSON
    ├── Step 4: callOxloText() → Rewrite (if score < 7.0) + callOxlo() re-review
    ├── Step 5: callOxloText() → Format
    └── Step 6: callOxloText() → Polish
    │
    └── Final SSE event: { type: 'result', output, score, tone, seo, length, apiCalls, researched }
```

The route handler opens a `TransformStream` and returns the readable end immediately, writing SSE frames as each step completes. The stream is always closed in a `finally` block.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| UI | React, Tailwind CSS, lucide-react |
| LLM | Oxlo API — model `deepseek-v3-0324` |
| Web search | Tavily REST API |
| Streaming | Server-Sent Events via Web Streams API |
| State | React `useReducer` |

---

## Setup

### 1. Prerequisites
- Node.js 18+

### 2. Install
```bash
cd taskflow-next
npm install
```

### 3. Environment
Create a `.env` file in `taskflow-next/`:
```
OXLO_API=your_oxlo_api_key
TAVILY_API=your_tavily_api_key
```

Both keys are server-side only — never exposed to the browser.

### 4. Run
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Features

### Core Pipeline
- 6-step autonomous pipeline streamed via SSE
- Self-correcting: reviews its own draft, rewrites only if needed (threshold: 7.0/10)
- Web-grounded: Tavily `advanced` search with score filtering and AI answer summary
- Research failure is non-fatal — pipeline continues without web context

### UI
- Chat-like interface: landing page slides into a conversation thread on first submit
- One pipeline step shown at a time with typewriter effect and animated scan line
- Each run shows step progress, score, tone, SEO rating, length, API call count
- Follow-up messages refine the previous output (passes `previousOutput` + `refinementNote` into pipeline)
- Full run history preserved in session via `useReducer`
- Copy and download buttons on every output

### Markdown Renderer
Output is rendered as formatted markdown — headings, bold/italic, inline and fenced code blocks, lists, links, dividers — parsed from scratch with no external library.

### Personalization Sidebar
A slide-in panel (settings icon, top-right) with two sections:

**Profile** — optional name/email stored in `localStorage` under `taskflow_profile`. Shows a "Logged in as" badge when set.

**Writing Preferences** — four controls:
- Tone: Formal / Casual / Witty / Authoritative
- Writing Style: Storytelling / Bullet-heavy / Data-driven / Conversational
- Audience: B2B / Students / General Public / Tech Folks
- Custom Instructions: free-text field

Preferences are stored in `localStorage` under `taskflow_prefs` and injected into the Step 2 (draft) and Step 4 (rewrite) system prompts on every run. An amber dot on the settings icon indicates active preferences.

---

## File Structure

```
taskflow-next/
├── app/
│   ├── api/
│   │   └── execute/
│   │       └── route.js              # 6-step SSE pipeline
│   ├── components/
│   │   ├── MarkdownRenderer.js       # Custom markdown renderer
│   │   └── PersonalizationSidebar.js # Preferences + profile panel
│   ├── layout.tsx
│   ├── page.js                       # Full UI + useReducer state machine
│   └── globals.css
├── lib/
│   ├── oxlo.js                       # callOxlo() + callOxloText()
│   └── tavily.js                     # searchWeb()
├── .env                              # OXLO_API + TAVILY_API
├── taskflow.md                       # Full technical documentation
└── README.md
```

---

## SSE Event Reference

```js
// Step update (emitted at start and end of each step)
{ type: 'step', step: 1-6, label: string, status: 'running'|'done'|'skipped', score?: number }

// Final result
{ type: 'result', output: string, score: number, tone: string, seo: string, length: string, platform: string, apiCalls: number, researched: boolean }

// Error
{ type: 'error', message: string }
```

---

## API Call Budget

| Condition | LLM calls | Tavily calls |
|---|---|---|
| Normal run, score ≥ 7 | 4 | 1 |
| Normal run, score < 7 | 6 | 1 |
| Refinement, score ≥ 7 | 4 | 0 |
| Refinement, score < 7 | 6 | 0 |

For full technical detail on every step, prompt, and data shape see [taskflow.md](taskflow.md).
