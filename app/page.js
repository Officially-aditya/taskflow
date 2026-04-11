"use client";

import { useReducer, useRef, useEffect, useState } from 'react';
import {
  CheckCircle2, SkipForward, Copy, Download,
  ChevronRight, ArrowUp, Settings, Loader2
} from 'lucide-react';
import Link from 'next/link';
import MarkdownRenderer from './components/MarkdownRenderer';
import PersonalizationSidebar from './components/PersonalizationSidebar';

const PLATFORMS = ['LinkedIn', 'Twitter/X', 'Blog', 'Email'];

const TEMPLATES = [
  {
    id: 'thought-leader',
    name: 'Thought Leader',
    emoji: '🧠',
    description: 'Authoritative long-form takes that position you as an expert in your field.',
    preferences: { tone: 'Authoritative', style: 'Data-driven', audience: 'B2B', customInstructions: 'Open with a bold contrarian claim. Back every point with a stat or real-world example. End with a strong call to action.' },
    exampleGoal: 'Write a LinkedIn post on why most companies are measuring AI ROI completely wrong',
    platform: 'LinkedIn',
  },
  {
    id: 'startup-founder',
    name: 'Startup Founder',
    emoji: '🚀',
    description: 'Raw, build-in-public energy. Honest, punchy, and human.',
    preferences: { tone: 'Casual', style: 'Storytelling', audience: 'Tech Folks', customInstructions: 'Write in first person. Share the behind-the-scenes reality, not the highlight reel. Keep sentences short. Avoid corporate language.' },
    exampleGoal: 'Write a Twitter thread about what nobody tells you about launching your first product',
    platform: 'Twitter/X',
  },
  {
    id: 'educator',
    name: 'The Educator',
    emoji: '📚',
    description: 'Clear, structured explainers that make complex topics click for any reader.',
    preferences: { tone: 'Formal', style: 'Bullet-heavy', audience: 'Students', customInstructions: 'Use simple analogies to explain difficult concepts. Structure with clear headings. Define jargon immediately when used. End with a one-sentence takeaway.' },
    exampleGoal: 'Write a blog post explaining how large language models work, for someone with no ML background',
    platform: 'Blog',
  },
  {
    id: 'growth-marketer',
    name: 'Growth Marketer',
    emoji: '📈',
    description: 'Conversion-focused copy that hooks fast and drives action.',
    preferences: { tone: 'Witty', style: 'Conversational', audience: 'General Public', customInstructions: 'Lead with the pain point, not the product. Use the PAS framework (Problem → Agitate → Solve). Include a single, clear CTA. No filler sentences.' },
    exampleGoal: 'Write a product launch email for a new AI writing tool targeting small business owners',
    platform: 'Email',
  },
  {
    id: 'tech-writer',
    name: 'Tech Writer',
    emoji: '⚙️',
    description: 'Precise, developer-friendly content with depth and zero fluff.',
    preferences: { tone: 'Formal', style: 'Data-driven', audience: 'Tech Folks', customInstructions: 'Use technical terms correctly but always explain them in context. Include concrete code examples or system diagrams where relevant. Prefer active voice. Never oversimplify.' },
    exampleGoal: 'Write a technical blog post on the architecture tradeoffs between RAG and fine-tuning for production LLM apps',
    platform: 'Blog',
  },
];

const EXAMPLE_GOALS = [
  "Write a LinkedIn post about why Indian startups should adopt AI early",
  "Write a Twitter thread about the future of remote work",
  "Write a blog post intro about building in public",
];

const initialState = {
  landingGoal: '',
  landingPlatform: 'LinkedIn',
  chatMode: false,
  originalGoal: '',
  messages: [],
  chatInput: '',
  chatPlatform: 'LinkedIn',
  copiedId: null,
};

let nextId = 1;

function updateLastMessage(messages, patch) {
  return messages.map((m, i) =>
    i === messages.length - 1 ? { ...m, ...patch } : m
  );
}

function updateLastMessageSteps(messages, step) {
  return messages.map((m, i) => {
    if (i !== messages.length - 1) return m;
    const existing = m.steps.findIndex(s => s.step === step.step);
    const steps = existing >= 0
      ? m.steps.map((s, si) => si === existing ? step : s)
      : [...m.steps, step];
    return { ...m, steps };
  });
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_LANDING_GOAL':     return { ...state, landingGoal: action.value };
    case 'SET_LANDING_PLATFORM': return { ...state, landingPlatform: action.value };
    case 'SET_CHAT_INPUT':       return { ...state, chatInput: action.value };
    case 'SET_CHAT_PLATFORM':    return { ...state, chatPlatform: action.value };

    case 'PIPELINE_START': {
      const newMsg = {
        id: nextId++,
        userText: action.userText,
        platform: action.platform,
        isRefinement: action.isRefinement,
        steps: [],
        result: null,
        status: 'running',
        error: null,
      };
      return {
        ...state,
        chatMode: true,
        originalGoal: state.originalGoal || action.userText,
        chatPlatform: action.platform,
        messages: [...state.messages, newMsg],
        chatInput: '',
        landingGoal: state.originalGoal || action.userText,
      };
    }

    case 'STEP_UPDATE':
      return { ...state, messages: updateLastMessageSteps(state.messages, action.step) };

    case 'PIPELINE_DONE':
      return { ...state, messages: updateLastMessage(state.messages, { result: action.result, status: 'done' }) };

    case 'PIPELINE_ERROR':
      return { ...state, messages: updateLastMessage(state.messages, { status: 'error', error: action.message }) };

    case 'SET_COPIED': return { ...state, copiedId: action.id };

    case 'RESET': return { ...initialState };

    default: return state;
  }
}

// ── Typewriter ────────────────────────────────────────────────────────────────

function Typewriter({ text }) {
  const [displayed, setDisplayed] = useState('');
  const [cursorVisible, setCursorVisible] = useState(true);

  useEffect(() => {
    setDisplayed('');
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(interval);
    }, 28);
    return () => clearInterval(interval);
  }, [text]);

  useEffect(() => {
    const blink = setInterval(() => setCursorVisible(v => !v), 530);
    return () => clearInterval(blink);
  }, []);

  return (
    <span>
      {displayed}
      <span className={`inline-block w-[2px] h-[1em] ml-[2px] align-middle bg-primary transition-opacity duration-100 ${cursorVisible ? 'opacity-100' : 'opacity-0'}`} />
    </span>
  );
}

// ── Pipeline Steps ────────────────────────────────────────────────────────────

function PipelineSteps({ steps, status }) {
  if (status === 'done') {
    const score = steps.find(s => s.score != null)?.score;
    const doneCount = steps.filter(s => s.status === 'done').length;
    const skippedCount = steps.filter(s => s.status === 'skipped').length;
    return (
      <div className="flex items-center gap-2 font-label text-xs text-on-surface-variant py-1">
        <CheckCircle2 className="w-3.5 h-3.5 text-primary/60 flex-shrink-0" />
        <span>
          {doneCount} steps complete · {skippedCount} skipped
          {score != null ? <span className="text-primary ml-1">· {score}/10</span> : ''}
        </span>
      </div>
    );
  }

  const current = steps[steps.length - 1];
  const stepNum  = current?.step ?? 0;
  const isRunning = current?.status === 'running';
  const isDone    = current?.status === 'done';
  const isSkipped = current?.status === 'skipped';
  const label     = current?.label ?? 'Initializing...';

  return (
    <div className="flex flex-col gap-3 py-1">
      {/* Progress track */}
      <div className="flex items-center gap-1.5">
        {[1, 2, 3, 4, 5, 6].map(n => {
          const s = steps.find(st => st.step === n);
          const filled = s?.status === 'done' || s?.status === 'skipped';
          const active = s?.status === 'running';
          return (
            <div key={n} className={`h-0.5 rounded-full transition-all duration-500 ${
              active  ? 'w-6 bg-primary shadow-[0_0_8px_rgba(95,255,247,0.8)] animate-[breath-glow_3s_ease-in-out_infinite]'
              : filled ? 'w-4 bg-primary/40'
                       : 'w-4 bg-outline-variant'
            }`} />
          );
        })}
        <span className="ml-1 font-mono text-[10px] text-on-surface-variant tabular-nums">{stepNum}/6</span>
      </div>

      {/* Active step card — tonal shift, no border */}
      <div className={`relative overflow-hidden rounded-xl px-4 py-3 transition-all duration-300 ${
        isRunning
          ? 'bg-surface-container-high shadow-[0_0_20px_rgba(95,255,247,0.08)]'
          : 'bg-surface-container'
      }`}>
        {/* Breathing outer glow ring — only while running */}
        {isRunning && (
          <>
            <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-primary/30 animate-[breath-glow_3s_ease-in-out_infinite]" />
            <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-xl">
              <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent animate-[scanline_2s_linear_infinite]" />
            </div>
          </>
        )}

        <div className="flex items-center gap-3">
          {/* Badge */}
          <div className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold font-mono transition-all duration-300 ${
            isRunning
              ? 'bg-primary/10 text-primary shadow-[0_0_10px_rgba(95,255,247,0.25)]'
              : isDone
                ? 'bg-surface-container-highest text-primary/50'
                : 'bg-surface-container-highest text-on-surface-variant'
          }`}>
            {isDone     ? <CheckCircle2 className="w-3.5 h-3.5" />
            : isSkipped ? <SkipForward className="w-3 h-3" />
            : isRunning ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        : stepNum}
          </div>

          {/* Label */}
          <span className={`text-sm font-body tracking-tight transition-colors ${
            isRunning ? 'text-primary' : isDone ? 'text-on-surface-variant' : 'text-on-surface-variant/60'
          }`}>
            {isRunning ? <Typewriter key={label} text={label} /> : label}
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Agent Bubble ──────────────────────────────────────────────────────────────

function AgentBubble({ result, isCopied, onCopy, onDownload }) {
  return (
    <div className="flex flex-col gap-3">
      {/* Metadata chips */}
      <div className="flex gap-2 flex-wrap">
        <span className="font-label text-xs px-2.5 py-1 primary-gradient text-on-primary rounded-full font-semibold">
          {result.score}/10
        </span>
        <span className="font-label text-xs px-2.5 py-1 bg-secondary-container text-on-secondary-container rounded-full">
          {result.tone}
        </span>
        <span className="font-label text-xs px-2.5 py-1 bg-secondary-container text-on-secondary-container rounded-full">
          {result.length}
        </span>
        <span className="font-label text-xs px-2.5 py-1 bg-secondary-container text-on-secondary-container rounded-full">
          SEO: {result.seo}
        </span>
        <span className="font-label text-xs px-2.5 py-1 bg-surface-container-high text-on-surface-variant rounded-full font-mono">
          {result.apiCalls} calls
        </span>
        {result.researched && (
          <span className="font-label text-xs px-2.5 py-1 bg-surface-container-high text-primary/80 rounded-full">
            Web grounded
          </span>
        )}
      </div>

      {/* Content — tonal card, no border */}
      <div className="bg-surface-container-low rounded-2xl rounded-tl-sm p-5 max-w-2xl">
        <MarkdownRenderer content={result.output} />
      </div>

      {/* Actions — ghost style */}
      <div className="flex gap-2 ml-1">
        <button
          onClick={onCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-label text-xs text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-all"
        >
          <Copy className="w-3.5 h-3.5" />
          {isCopied ? 'Copied!' : 'Copy'}
        </button>
        <button
          onClick={onDownload}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-label text-xs text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-all"
        >
          <Download className="w-3.5 h-3.5" />
          Download
        </button>
      </div>
    </div>
  );
}

// ── Templates Dropdown ────────────────────────────────────────────────────────

function TemplatesDropdown({ onApply }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className={`font-label text-sm transition-colors ${open ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
      >
        Templates
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-3 w-80 bg-surface-container/90 backdrop-blur-2xl rounded-2xl overflow-hidden z-50 shadow-ambient-primary">
          <div className="px-4 py-3 border-b border-outline-variant/20">
            <p className="font-headline text-xs font-semibold text-on-surface tracking-tight">Personality Templates</p>
            <p className="font-label text-[11px] text-on-surface-variant mt-0.5">Click to apply preferences + example goal</p>
          </div>
          <div className="flex flex-col">
            {TEMPLATES.map((t) => (
              <button
                key={t.id}
                onClick={() => { onApply(t); setOpen(false); }}
                className="flex items-start gap-3 px-4 py-3.5 hover:bg-surface-container-high transition-all text-left group"
              >
                <span className="text-xl flex-shrink-0 mt-0.5">{t.emoji}</span>
                <div className="min-w-0">
                  <p className="font-headline text-sm font-semibold text-on-surface group-hover:text-primary transition-colors">{t.name}</p>
                  <p className="font-label text-xs text-on-surface-variant leading-relaxed mt-0.5">{t.description}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {[t.preferences.tone, t.preferences.style, t.preferences.audience].filter(Boolean).map(tag => (
                      <span key={tag} className="font-label text-[10px] px-2 py-0.5 bg-secondary-container text-on-secondary-container rounded-full">{tag}</span>
                    ))}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Settings Button ───────────────────────────────────────────────────────────

function SettingsButton({ onClick, hasPreferences }) {
  return (
    <button
      onClick={onClick}
      className="relative p-2 rounded-lg text-on-surface-variant hover:text-primary transition-colors duration-200"
    >
      <Settings className="w-[18px] h-[18px]" />
      {hasPreferences && (
        <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-tertiary" />
      )}
    </button>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function Home() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const messagesEndRef = useRef(null);
  const chatInputRef   = useRef(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [preferences, setPreferences] = useState({});

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('taskflow_prefs') || 'null');
      if (stored) setPreferences(stored);
    } catch {}
  }, []);

  const hasPreferences = Object.values(preferences).some(v => v && v.toString().trim() !== '');
  const isRunning = state.messages.some(m => m.status === 'running');
  const lastRun   = [...state.messages].reverse().find(m => m.status === 'done');

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.messages]);

  const executePipeline = async ({ userText, platform, isRefinement }) => {
    dispatch({ type: 'PIPELINE_START', userText, platform, isRefinement });

    const body = { goal: state.originalGoal || userText, platform, preferences };
    if (isRefinement && lastRun) {
      body.previousOutput = lastRun.result.output;
      body.refinementNote = userText;
    }

    try {
      const response = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const reader  = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop();
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const event = JSON.parse(line.slice(6));
          if (event.type === 'step')   dispatch({ type: 'STEP_UPDATE',    step: event });
          else if (event.type === 'result') dispatch({ type: 'PIPELINE_DONE',  result: event });
          else if (event.type === 'error')  dispatch({ type: 'PIPELINE_ERROR', message: event.message });
        }
      }
    } catch (err) {
      dispatch({ type: 'PIPELINE_ERROR', message: err.message });
    }
  };

  const handleLandingSubmit = (e) => {
    e?.preventDefault();
    if (!state.landingGoal.trim() || isRunning) return;
    executePipeline({ userText: state.landingGoal, platform: state.landingPlatform, isRefinement: false });
  };

  const handleChatSubmit = (e) => {
    e?.preventDefault();
    if (!state.chatInput.trim() || isRunning) return;
    executePipeline({ userText: state.chatInput, platform: state.chatPlatform, isRefinement: !!lastRun });
  };

  const handleChatKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleChatSubmit(); }
  };

  const handleCopy = async (text, id) => {
    await navigator.clipboard.writeText(text);
    dispatch({ type: 'SET_COPIED', id });
    setTimeout(() => dispatch({ type: 'SET_COPIED', id: null }), 2000);
  };

  const handleDownload = (text, platform, runIdx) => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `taskflow-${platform.toLowerCase().replace('/', '-')}-v${runIdx + 1}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-screen bg-background text-on-surface font-body overflow-hidden relative">

      <PersonalizationSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onSave={(prefs) => setPreferences(prefs)}
      />

      {/* ── LANDING ──────────────────────────────────────────────────────────── */}
      {!state.chatMode && (
        <div className="absolute inset-0 flex flex-col overflow-y-auto animate-in fade-in duration-300 bg-background">

          {/* Header */}
          <header className="w-full sticky top-0 bg-background/80 backdrop-blur-xl z-50">
            <nav className="flex justify-between items-center px-8 py-5 max-w-4xl mx-auto">
              <button onClick={() => dispatch({ type: 'RESET' })} className="font-headline text-base font-semibold tracking-tight text-on-surface flex items-center gap-2 hover:text-primary transition-colors">
                <span className="material-symbols-outlined text-2xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
                TaskFlow AI
              </button>
              <div className="hidden md:flex items-center gap-8 font-label text-sm">
                <span className="text-on-surface font-medium cursor-pointer hover:text-primary transition-colors">Dashboard</span>
                <span className="text-on-surface-variant cursor-pointer hover:text-on-surface transition-colors">History</span>
                <TemplatesDropdown onApply={(t) => {
                  setPreferences(t.preferences);
                  localStorage.setItem('taskflow_prefs', JSON.stringify(t.preferences));
                  dispatch({ type: 'SET_LANDING_GOAL', value: t.exampleGoal });
                  dispatch({ type: 'SET_LANDING_PLATFORM', value: t.platform });
                }} />
              </div>
              <SettingsButton onClick={() => setSidebarOpen(true)} hasPreferences={hasPreferences} />
            </nav>
          </header>

          {/* Main */}
          <main className="flex flex-col items-center justify-center px-6 py-12 max-w-4xl mx-auto w-full flex-1">

            {/* Hero */}
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-5xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
              </div>
              <h1 className="font-headline text-3xl md:text-5xl font-bold tracking-tight mb-3 text-on-surface">
                TaskFlow AI
              </h1>
              <p className="font-body text-base text-on-surface-variant max-w-lg mx-auto leading-relaxed">
                Content pipeline agent — drafts, reviews, rewrites, and formats autonomously.
              </p>
            </div>

            {/* Input card — tonal, no border */}
            <form onSubmit={handleLandingSubmit} className="w-full bg-surface-container rounded-2xl p-5 md:p-7 mb-10 glow-surface">
              {/* Platform pills */}
              <div className="flex flex-wrap gap-2 mb-5">
                {PLATFORMS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => dispatch({ type: 'SET_LANDING_PLATFORM', value: p })}
                    className={`font-label px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                      state.landingPlatform === p
                        ? 'primary-gradient text-on-primary'
                        : 'bg-surface-container-highest text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>

              {/* Textarea + submit */}
              <div className="input-focus-accent relative pl-4">
                <textarea
                  value={state.landingGoal}
                  onChange={(e) => dispatch({ type: 'SET_LANDING_GOAL', value: e.target.value })}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleLandingSubmit(); } }}
                  placeholder="e.g. Write a LinkedIn post about why Indian startups should adopt AI early"
                  className="w-full bg-transparent border-none focus:ring-0 text-base text-on-surface placeholder:text-outline resize-none h-28 md:h-36 font-body leading-relaxed outline-none"
                  autoFocus
                />
                <div className="absolute bottom-0 right-0">
                  <button
                    type="submit"
                    disabled={!state.landingGoal.trim()}
                    className="primary-gradient text-on-primary font-label font-semibold px-5 py-2.5 rounded-full flex items-center gap-2 text-sm hover:scale-105 active:scale-95 transition-transform shadow-glow-primary disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    Run Pipeline
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </form>

            {/* Examples */}
            <section className="w-full">
              <p className="font-label text-xs uppercase tracking-[0.3em] text-outline text-center mb-5">Try an example</p>
              <div className="flex flex-col gap-2">
                {EXAMPLE_GOALS.map((text, i) => (
                  <button
                    key={i}
                    onClick={() => dispatch({ type: 'SET_LANDING_GOAL', value: text })}
                    className="w-full py-3.5 px-6 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface-variant hover:text-on-surface text-left transition-all flex justify-between items-center group"
                  >
                    <span className="font-body text-sm italic">"{text}"</span>
                    <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-primary flex-shrink-0 ml-4" />
                  </button>
                ))}
              </div>
            </section>
          </main>

          {/* Footer */}
          <footer className="w-full py-8 flex flex-col items-center gap-3">
            <div className="font-headline text-sm font-medium text-on-surface-variant opacity-40">TaskFlow AI</div>
            <div className="flex gap-8 font-label text-xs uppercase tracking-widest text-on-surface-variant/60">
              <Link href="/privacy" className="hover:text-on-surface-variant transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-on-surface-variant transition-colors">Terms</Link>
              <Link href="/support" className="hover:text-on-surface-variant transition-colors">Support</Link>
            </div>
            <div className="font-label text-xs text-on-surface-variant/30 mt-2">© 2026 TaskFlow AI</div>
          </footer>

        </div>
      )}

      {/* ── CHAT ─────────────────────────────────────────────────────────────── */}
      {state.chatMode && (
        <div className="absolute inset-0 flex flex-col animate-in fade-in duration-300 bg-background">

          {/* Header — glassmorphism, no border, tonal shift via bg opacity */}
          <header className="flex-shrink-0 flex items-center justify-between px-6 py-4 bg-surface-container-low/80 backdrop-blur-xl z-10">
            <div className="flex items-center gap-3 min-w-0">
              <span className="material-symbols-outlined text-xl text-primary flex-shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
              <button onClick={() => dispatch({ type: 'RESET' })} className="font-headline font-semibold text-on-surface text-sm tracking-tight hover:text-primary transition-colors">TaskFlow AI</button>
              {state.originalGoal && (
                <>
                  <span className="text-outline flex-shrink-0">·</span>
                  <span className="font-body text-on-surface-variant text-xs truncate">{state.originalGoal}</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {PLATFORMS.map((p) => (
                <button
                  key={p}
                  onClick={() => dispatch({ type: 'SET_CHAT_PLATFORM', value: p })}
                  disabled={isRunning}
                  className={`font-label px-3 py-1 rounded-full text-xs font-medium transition-all disabled:opacity-40 ${
                    state.chatPlatform === p
                      ? 'primary-gradient text-on-primary'
                      : 'bg-surface-container-highest text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  {p}
                </button>
              ))}
              <SettingsButton onClick={() => setSidebarOpen(true)} hasPreferences={hasPreferences} />
            </div>
          </header>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-6 py-8">
            <div className="max-w-2xl mx-auto w-full space-y-10">
              {state.messages.map((msg, idx) => (
                <div key={msg.id} className="flex flex-col gap-4">

                  {/* User bubble — tonal, no border */}
                  <div className="flex justify-end">
                    <div className="max-w-sm bg-surface-container-highest rounded-2xl rounded-tr-sm px-4 py-3">
                      {msg.isRefinement && (
                        <p className="font-label text-[10px] text-primary/60 uppercase tracking-wider font-medium mb-1">Refinement</p>
                      )}
                      <p className="font-body text-on-surface text-sm leading-relaxed">{msg.userText}</p>
                      <p className="font-label text-[10px] text-on-surface-variant/60 mt-1.5">{msg.platform}</p>
                    </div>
                  </div>

                  {/* Agent side */}
                  <div className="flex flex-col gap-3">

                    {/* Pipeline card — tonal, active state has ambient glow */}
                    <div className={`rounded-xl px-4 py-3 max-w-sm transition-all duration-300 ${
                      msg.status === 'running'
                        ? 'bg-surface-container-low shadow-ambient-primary'
                        : 'bg-surface-container-low'
                    }`}>
                      <p className="font-label text-[10px] text-on-surface-variant/60 uppercase tracking-widest font-medium mb-2 flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                          msg.status === 'running' ? 'bg-primary animate-[breath-glow_3s_ease-in-out_infinite] shadow-[0_0_6px_rgba(95,255,247,0.8)]'
                          : msg.status === 'done'  ? 'bg-primary/30'
                                                   : 'bg-outline'
                        }`} />
                        {msg.status === 'running' ? 'Pipeline running' : msg.status === 'done' ? 'Pipeline complete' : 'Pipeline'}
                      </p>
                      <PipelineSteps steps={msg.steps} status={msg.status} />
                    </div>

                    {/* Output */}
                    {msg.status === 'done' && msg.result && (
                      <div className="animate-in fade-in slide-in-from-bottom-2 duration-400">
                        <AgentBubble
                          result={msg.result}
                          isCopied={state.copiedId === msg.id}
                          onCopy={() => handleCopy(msg.result.output, msg.id)}
                          onDownload={() => handleDownload(msg.result.output, msg.result.platform, idx)}
                        />
                      </div>
                    )}

                    {/* Error */}
                    {msg.status === 'error' && (
                      <div className="p-3 bg-error-container/20 rounded-xl font-label text-error text-xs max-w-sm">
                        Pipeline failed: {msg.error}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input bar — tonal shift from messages, no border */}
          <div className="flex-shrink-0 bg-surface-container-low/80 backdrop-blur-xl px-6 py-4">
            <form onSubmit={handleChatSubmit} className="max-w-2xl mx-auto">
              <div className="input-focus-accent flex items-end gap-3 bg-surface-container-highest rounded-2xl pl-5 pr-3 py-3">
                <textarea
                  ref={chatInputRef}
                  value={state.chatInput}
                  onChange={(e) => dispatch({ type: 'SET_CHAT_INPUT', value: e.target.value })}
                  onKeyDown={handleChatKeyDown}
                  placeholder={lastRun ? "Refine the output — e.g. make it shorter, punchier hook..." : "Describe your content goal..."}
                  rows={1}
                  disabled={isRunning}
                  className="flex-1 bg-transparent font-body text-on-surface placeholder:text-outline focus:outline-none resize-none text-sm leading-relaxed max-h-36 overflow-y-auto disabled:opacity-40"
                  style={{ fieldSizing: 'content' }}
                />
                <button
                  type="submit"
                  disabled={!state.chatInput.trim() || isRunning}
                  className="flex-shrink-0 w-8 h-8 primary-gradient text-on-primary rounded-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {isRunning
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <ArrowUp className="w-4 h-4" />
                  }
                </button>
              </div>
              <p className="font-label text-[11px] text-on-surface-variant/40 mt-2 text-center">
                {lastRun ? 'Follow-up refines the previous output · Enter to send · Shift+Enter for newline' : 'Enter to send · Shift+Enter for newline'}
              </p>
            </form>
          </div>

        </div>
      )}
    </div>
  );
}
