"use client";

import { useReducer, useRef, useEffect, useState } from 'react';
import {
  Loader2, Zap, CheckCircle2, SkipForward, Copy, Download,
  ChevronRight, ArrowUp, Settings
} from 'lucide-react';
import MarkdownRenderer from './components/MarkdownRenderer';
import PersonalizationSidebar from './components/PersonalizationSidebar';

const PLATFORMS = ['LinkedIn', 'Twitter/X', 'Blog', 'Email'];


const EXAMPLE_GOALS = [
  "Write a LinkedIn post about why Indian startups should adopt AI early",
  "Write a Twitter thread about the future of remote work",
  "Write a blog post intro about building in public",
];

// message shape: { id, userText, platform, isRefinement, steps[], result, status, error, copiedId }
const initialState = {
  // landing
  landingGoal: '',
  landingPlatform: 'LinkedIn',
  // chat
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
    case 'SET_LANDING_GOAL': return { ...state, landingGoal: action.value };
    case 'SET_LANDING_PLATFORM': return { ...state, landingPlatform: action.value };
    case 'SET_CHAT_INPUT': return { ...state, chatInput: action.value };
    case 'SET_CHAT_PLATFORM': return { ...state, chatPlatform: action.value };

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
      return {
        ...state,
        messages: updateLastMessage(state.messages, { result: action.result, status: 'done' }),
      };

    case 'PIPELINE_ERROR':
      return {
        ...state,
        messages: updateLastMessage(state.messages, { status: 'error', error: action.message }),
      };

    case 'SET_COPIED': return { ...state, copiedId: action.id };

    default: return state;
  }
}

// ── Typewriter effect ─────────────────────────────────────────────────────────

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
      <span className={`inline-block w-[2px] h-[1em] ml-[2px] align-middle bg-emerald-400 transition-opacity duration-100 ${cursorVisible ? 'opacity-100' : 'opacity-0'}`} />
    </span>
  );
}

// ── Pipeline steps inline widget ─────────────────────────────────────────────

function PipelineSteps({ steps, status }) {
  if (status === 'done') {
    const score = steps.find(s => s.score != null)?.score;
    const doneCount = steps.filter(s => s.status === 'done').length;
    const skippedCount = steps.filter(s => s.status === 'skipped').length;
    return (
      <div className="flex items-center gap-2 text-xs text-neutral-500 py-1">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500/60" />
        <span>
          {doneCount} steps · {skippedCount} skipped
          {score != null ? ` · Score ${score}/10` : ''}
        </span>
      </div>
    );
  }

  // Current step = last step received from SSE
  const current = steps[steps.length - 1];
  const stepNum = current?.step ?? 0;
  const isRunning = current?.status === 'running';
  const isDone = current?.status === 'done';
  const isSkipped = current?.status === 'skipped';
  const label = current?.label ?? 'Initializing...';

  return (
    <div className="flex flex-col gap-3 py-1">
      {/* Progress dots */}
      <div className="flex items-center gap-1.5">
        {[1, 2, 3, 4, 5, 6].map(n => {
          const s = steps.find(st => st.step === n);
          const filled = s?.status === 'done' || s?.status === 'skipped';
          const active = s?.status === 'running';
          return (
            <div
              key={n}
              className={`h-1 rounded-full transition-all duration-500 ${
                active   ? 'w-5 bg-emerald-400 shadow-[0_0_6px_1px_rgba(52,211,153,0.7)]' :
                filled   ? 'w-3 bg-emerald-600' :
                           'w-3 bg-neutral-800'
              }`}
            />
          );
        })}
        <span className="ml-1 text-[10px] text-neutral-600 font-mono tabular-nums">
          {stepNum}/6
        </span>
      </div>

      {/* Active step card */}
      <div className={`relative overflow-hidden rounded-xl border px-4 py-3 transition-all duration-300 ${
        isRunning ? 'border-emerald-500/30 bg-emerald-500/5 shadow-[0_0_20px_0px_rgba(52,211,153,0.08)]'
        : isDone  ? 'border-emerald-800/40 bg-neutral-900/60'
                  : 'border-neutral-800/50 bg-neutral-900/40'
      }`}>
        {/* Animated scan line — only while running */}
        {isRunning && (
          <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-xl">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent animate-[scanline_2s_linear_infinite]" />
          </div>
        )}

        <div className="flex items-center gap-3">
          {/* Step number badge */}
          <div className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold font-mono border transition-all duration-300 ${
            isRunning ? 'border-emerald-400/60 text-emerald-400 bg-emerald-500/10 shadow-[0_0_10px_rgba(52,211,153,0.3)]'
            : isDone  ? 'border-emerald-700 text-emerald-600 bg-emerald-900/20'
            : isSkipped ? 'border-neutral-700 text-neutral-500'
                        : 'border-neutral-700 text-neutral-500'
          }`}>
            {isDone    ? <CheckCircle2 className="w-3.5 h-3.5" />
            : isSkipped ? <SkipForward className="w-3 h-3" />
            : isRunning ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        : stepNum}
          </div>

          {/* Label */}
          <span className={`text-sm font-medium tracking-tight ${
            isRunning ? 'text-emerald-300'
            : isDone  ? 'text-neutral-400'
                      : 'text-neutral-500'
          }`}>
            {isRunning
              ? <Typewriter key={label} text={label} />
              : label
            }
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Agent output bubble ───────────────────────────────────────────────────────

function AgentBubble({ result, isCopied, onCopy, onDownload }) {
  return (
    <div className="flex flex-col gap-3">
      {/* metadata chips */}
      <div className="flex gap-2 flex-wrap">
        <span className="text-xs px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full font-medium">
          {result.score}/10
        </span>
        <span className="text-xs px-2.5 py-1 bg-neutral-800 text-neutral-400 rounded-full">
          {result.tone}
        </span>
        <span className="text-xs px-2.5 py-1 bg-neutral-800 text-neutral-400 rounded-full">
          {result.length}
        </span>
        <span className="text-xs px-2.5 py-1 bg-neutral-800 text-neutral-400 rounded-full">
          SEO: {result.seo}
        </span>
        <span className="text-xs px-2.5 py-1 bg-neutral-800/60 text-neutral-500 rounded-full font-mono">
          {result.apiCalls} calls
        </span>
        {result.researched && (
          <span className="text-xs px-2.5 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full font-medium">
            Web grounded
          </span>
        )}
      </div>

      {/* content */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl rounded-tl-sm p-4 max-w-2xl">
        <MarkdownRenderer content={result.output} />
      </div>

      {/* actions */}
      <div className="flex gap-2 ml-1">
        <button
          onClick={onCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 text-neutral-400 hover:text-neutral-200 rounded-lg text-xs font-medium transition-all"
        >
          <Copy className="w-3.5 h-3.5" />
          {isCopied ? 'Copied!' : 'Copy'}
        </button>
        <button
          onClick={onDownload}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 text-neutral-400 hover:text-neutral-200 rounded-lg text-xs font-medium transition-all"
        >
          <Download className="w-3.5 h-3.5" />
          Download
        </button>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function Home() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const messagesEndRef = useRef(null);
  const chatInputRef = useRef(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [preferences, setPreferences] = useState({});

  // Load preferences from localStorage after mount (SSR-safe)
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('taskflow_prefs') || 'null');
      if (stored) setPreferences(stored);
    } catch {}
  }, []);

  const hasPreferences = Object.values(preferences).some(v => v && v.toString().trim() !== '');

  const isRunning = state.messages.some(m => m.status === 'running');
  const lastRun = [...state.messages].reverse().find(m => m.status === 'done');

  // Auto-scroll to bottom when new content arrives
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

      const reader = response.body.getReader();
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
          if (event.type === 'step') dispatch({ type: 'STEP_UPDATE', step: event });
          else if (event.type === 'result') dispatch({ type: 'PIPELINE_DONE', result: event });
          else if (event.type === 'error') dispatch({ type: 'PIPELINE_ERROR', message: event.message });
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
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleChatSubmit();
    }
  };

  const handleCopy = async (text, id) => {
    await navigator.clipboard.writeText(text);
    dispatch({ type: 'SET_COPIED', id });
    setTimeout(() => dispatch({ type: 'SET_COPIED', id: null }), 2000);
  };

  const handleDownload = (text, platform, runIdx) => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `taskflow-${platform.toLowerCase().replace('/', '-')}-v${runIdx + 1}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-screen bg-neutral-950 text-neutral-50 font-sans overflow-hidden relative">

      <PersonalizationSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onSave={(prefs) => setPreferences(prefs)}
      />

      {/* ── LANDING VIEW ─────────────────────────────────────────────────────── */}
      {!state.chatMode && (
      <div className="absolute inset-0 flex flex-col items-center justify-center px-6 animate-in fade-in duration-300">
        {/* Settings button — top right */}
        <div className="absolute top-4 right-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="relative w-9 h-9 flex items-center justify-center rounded-xl text-neutral-500 hover:text-neutral-200 hover:bg-neutral-800 border border-transparent hover:border-neutral-700 transition-all"
          >
            <Settings className="w-[18px] h-[18px]" />
            {hasPreferences && (
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-amber-400" />
            )}
          </button>
        </div>
        <div className="w-full max-w-xl">
          {/* Logo */}
          <div className="text-center mb-10">
            <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-emerald-400 to-cyan-500 bg-clip-text text-transparent inline-flex items-center gap-3 mb-3">
              <Zap className="w-10 h-10 text-emerald-400" />
              TaskFlow AI
            </h1>
            <p className="text-neutral-400 text-base">
              Content pipeline agent — drafts, reviews, rewrites, and formats autonomously.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLandingSubmit} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-2xl flex flex-col gap-4">
            <textarea
              value={state.landingGoal}
              onChange={(e) => dispatch({ type: 'SET_LANDING_GOAL', value: e.target.value })}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleLandingSubmit(); } }}
              placeholder="e.g. Write a LinkedIn post about why Indian startups should adopt AI early"
              className="w-full h-28 bg-neutral-950 border border-neutral-800 rounded-xl p-4 text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 resize-none transition-all text-sm"
              autoFocus
            />

            <div className="flex items-center justify-between gap-4">
              <div className="flex gap-2 flex-wrap">
                {PLATFORMS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => dispatch({ type: 'SET_LANDING_PLATFORM', value: p })}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                      state.landingPlatform === p
                        ? 'bg-emerald-500 text-emerald-950 border-emerald-500'
                        : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:border-neutral-600'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
              <button
                type="submit"
                disabled={!state.landingGoal.trim()}
                className="bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold py-2 px-5 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm flex-shrink-0"
              >
                Run Pipeline <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Examples */}
          <div className="mt-6">
            <p className="text-xs text-neutral-600 uppercase tracking-wider mb-3 text-center">Try an example</p>
            <div className="flex flex-col gap-2">
              {EXAMPLE_GOALS.map((text, i) => (
                <button
                  key={i}
                  onClick={() => dispatch({ type: 'SET_LANDING_GOAL', value: text })}
                  className="text-left px-4 py-3 rounded-xl bg-neutral-900/50 hover:bg-neutral-800 border border-neutral-800/50 hover:border-neutral-700 text-neutral-400 hover:text-neutral-200 transition-all text-sm"
                >
                  {text}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      )}

      {/* ── CHAT VIEW ────────────────────────────────────────────────────────── */}
      {state.chatMode && (
      <div className="absolute inset-0 flex flex-col animate-in fade-in duration-300">

        {/* Header */}
        <header className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-neutral-800/60 bg-neutral-950/80 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <Zap className="w-5 h-5 text-emerald-400" />
            <span className="font-semibold text-neutral-200">TaskFlow AI</span>
            {state.originalGoal && (
              <>
                <span className="text-neutral-700">/</span>
                <span className="text-neutral-500 text-sm truncate max-w-xs">{state.originalGoal}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            {PLATFORMS.map((p) => (
              <button
                key={p}
                onClick={() => dispatch({ type: 'SET_CHAT_PLATFORM', value: p })}
                disabled={isRunning}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all border ${
                  state.chatPlatform === p
                    ? 'bg-emerald-500 text-emerald-950 border-emerald-500'
                    : 'bg-neutral-900 text-neutral-500 border-neutral-800 hover:border-neutral-600 hover:text-neutral-300'
                } disabled:opacity-50`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setSidebarOpen(true)}
              className="relative w-8 h-8 flex items-center justify-center rounded-lg text-neutral-500 hover:text-neutral-200 hover:bg-neutral-800 border border-transparent hover:border-neutral-700 transition-all ml-1"
            >
              <Settings className="w-[18px] h-[18px]" />
              {hasPreferences && (
                <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-amber-400" />
              )}
            </button>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
          <div className="max-w-2xl mx-auto w-full space-y-8">
            {state.messages.map((msg, idx) => (
              <div key={msg.id} className="flex flex-col gap-4">

                {/* User bubble */}
                <div className="flex justify-end">
                  <div className="max-w-sm bg-neutral-800 border border-neutral-700 rounded-2xl rounded-tr-sm px-4 py-3">
                    {msg.isRefinement && (
                      <p className="text-[10px] text-emerald-500/70 uppercase tracking-wider font-medium mb-1">Refinement</p>
                    )}
                    <p className="text-neutral-200 text-sm leading-relaxed">{msg.userText}</p>
                    <p className="text-[10px] text-neutral-600 mt-1.5">{msg.platform}</p>
                  </div>
                </div>

                {/* Agent side */}
                <div className="flex flex-col gap-3">

                  {/* Pipeline steps */}
                  <div className="bg-neutral-900/50 border border-neutral-800/50 rounded-xl px-4 py-3 max-w-sm">
                    <p className="text-[10px] text-neutral-600 uppercase tracking-wider font-medium mb-2 flex items-center gap-1.5">
                      <Zap className="w-3 h-3 text-emerald-500/60" />
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
                    <div className="p-3 bg-red-950/30 border border-red-900/50 rounded-xl text-red-400 text-xs max-w-sm">
                      Pipeline failed: {msg.error}
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input bar */}
        <div className="flex-shrink-0 border-t border-neutral-800/60 bg-neutral-950/80 backdrop-blur-sm px-6 py-4">
          <form onSubmit={handleChatSubmit} className="max-w-2xl mx-auto">
            <div className="flex items-end gap-3 bg-neutral-900 border border-neutral-800 rounded-2xl px-4 py-3 focus-within:border-emerald-500/40 focus-within:ring-1 focus-within:ring-emerald-500/20 transition-all">
              <textarea
                ref={chatInputRef}
                value={state.chatInput}
                onChange={(e) => dispatch({ type: 'SET_CHAT_INPUT', value: e.target.value })}
                onKeyDown={handleChatKeyDown}
                placeholder={lastRun ? "Refine the output — e.g. make it shorter, punchier hook..." : "Describe your content goal..."}
                rows={1}
                disabled={isRunning}
                className="flex-1 bg-transparent text-neutral-100 placeholder:text-neutral-600 focus:outline-none resize-none text-sm leading-relaxed max-h-36 overflow-y-auto disabled:opacity-50"
                style={{ fieldSizing: 'content' }}
              />
              <button
                type="submit"
                disabled={!state.chatInput.trim() || isRunning}
                className="flex-shrink-0 w-8 h-8 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 rounded-xl flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isRunning
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <ArrowUp className="w-4 h-4" />
                }
              </button>
            </div>
            <p className="text-[11px] text-neutral-700 mt-2 text-center">
              {lastRun ? 'Follow-up will refine the previous output · Enter to send · Shift+Enter for newline' : 'Enter to send'}
            </p>
          </form>
        </div>

      </div>
      )}
    </div>
  );
}
