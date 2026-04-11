"use client";

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { TEMPLATES } from '../lib/templates';

const PLATFORM_COLORS = {
  'LinkedIn':  'bg-blue-500/10 text-blue-300',
  'Twitter/X': 'bg-sky-500/10 text-sky-300',
  'Blog':      'bg-purple-500/10 text-purple-300',
  'Email':     'bg-amber-500/10 text-amber-300',
};

export default function Templates() {
  const router = useRouter();

  const handleApply = (t) => {
    localStorage.setItem('taskflow_prefs', JSON.stringify(t.preferences));
    localStorage.setItem('taskflow_pending_goal', t.exampleGoal);
    localStorage.setItem('taskflow_pending_platform', t.platform);
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-background text-on-surface font-body">

      {/* Header */}
      <header className="w-full sticky top-0 bg-background/80 backdrop-blur-xl z-50">
        <nav className="flex items-center justify-between px-8 py-5 max-w-5xl mx-auto">
          <Link href="/" className="font-headline text-base font-semibold tracking-tight text-on-surface hover:text-primary transition-colors flex items-center gap-2">
            <span className="material-symbols-outlined text-2xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
            TaskFlow AI
          </Link>
          <Link href="/" className="font-label text-xs text-on-surface-variant hover:text-on-surface transition-colors flex items-center gap-1">
            <ChevronRight className="w-3 h-3 rotate-180" />
            Back to Dashboard
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <main className="px-6 py-16 max-w-5xl mx-auto">
        <p className="font-label text-xs uppercase tracking-[0.3em] text-outline mb-4">Templates</p>
        <h1 className="font-headline text-3xl font-bold tracking-tight text-on-surface mb-2">Personality Templates</h1>
        <p className="text-on-surface-variant text-sm leading-relaxed max-w-xl mb-14">
          Each template bundles a writing style, tone, and audience setting tuned for a specific creative persona. Apply one to instantly configure your pipeline — the example goal is pre-filled and ready to run.
        </p>

        {/* Template grid */}
        <div className="flex flex-col gap-3">
          {TEMPLATES.map((t) => (
            <div
              key={t.id}
              className="bg-surface-container rounded-2xl px-6 py-5 flex items-center gap-6 hover:bg-surface-container-high transition-all group"
            >
              {/* Emoji */}
              <span className="text-3xl flex-shrink-0">{t.emoji}</span>

              {/* Name + description */}
              <div className="w-44 flex-shrink-0">
                <h2 className="font-headline text-sm font-semibold text-on-surface group-hover:text-primary transition-colors">{t.name}</h2>
                <p className="font-label text-xs text-on-surface-variant mt-0.5 leading-relaxed">{t.description}</p>
              </div>

              {/* Preferences */}
              <div className="flex flex-col gap-1 w-40 flex-shrink-0">
                {[['Tone', t.preferences.tone], ['Style', t.preferences.style], ['Audience', t.preferences.audience]].map(([label, val]) => (
                  <div key={label} className="flex items-center gap-2 font-label text-xs">
                    <span className="text-outline w-12 flex-shrink-0">{label}</span>
                    <span className="text-on-surface-variant">{val}</span>
                  </div>
                ))}
              </div>

              {/* Example goal */}
              <div className="flex-1 min-w-0">
                <p className="font-label text-[10px] uppercase tracking-widest text-outline mb-1">Example goal</p>
                <p className="font-body text-sm text-on-surface-variant italic leading-relaxed truncate">&ldquo;{t.exampleGoal}&rdquo;</p>
              </div>

              {/* Platform + CTA */}
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className={`font-label text-[10px] px-2.5 py-1 rounded-full ${PLATFORM_COLORS[t.platform]}`}>
                  {t.platform}
                </span>
                <button
                  onClick={() => handleApply(t)}
                  className="primary-gradient text-on-primary font-label font-semibold text-xs px-4 py-2 rounded-full flex items-center gap-1.5 hover:scale-105 active:scale-95 transition-transform"
                >
                  Use template
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-10 max-w-5xl mx-auto flex items-center justify-between border-t border-outline-variant/20 mt-10">
        <span className="font-label text-xs text-on-surface-variant/40">© 2026 TaskFlow AI</span>
        <div className="flex gap-6 font-label text-xs text-on-surface-variant/50">
          <Link href="/privacy" className="hover:text-on-surface-variant transition-colors">Privacy</Link>
          <Link href="/terms" className="hover:text-on-surface-variant transition-colors">Terms</Link>
          <Link href="/support" className="hover:text-on-surface-variant transition-colors">Support</Link>
        </div>
      </footer>

    </div>
  );
}
