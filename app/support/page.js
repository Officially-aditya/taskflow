import Link from 'next/link';

export const metadata = { title: 'Support — TaskFlow AI' };

const FAQS = [
  {
    q: 'Why did the pipeline skip Step 4?',
    a: 'Step 4 (Rewrite) only runs if the review score is below 7.0/10. If your draft scored 7 or higher, the rewrite is skipped and the pipeline moves directly to formatting.',
  },
  {
    q: 'Why did Step 1 (Research) get skipped?',
    a: 'Research is skipped on refinement runs — when you submit a follow-up to improve a previous output. The prior output already contains grounded content, so re-searching is unnecessary.',
  },
  {
    q: 'Can I use TaskFlow AI without setting preferences?',
    a: 'Yes. All preferences are optional. The pipeline runs with default behavior if no tone, style, or audience is set.',
  },
  {
    q: 'Where is my data stored?',
    a: 'Your preferences and profile are stored only in your browser\'s localStorage. Nothing is sent to our servers. See the Privacy Policy for full details.',
  },
  {
    q: 'How do I clear my preferences?',
    a: 'Open the personalization sidebar (settings icon, top right) and use the "Clear" link next to your profile, or delete taskflow_prefs and taskflow_profile from your browser\'s localStorage.',
  },
  {
    q: 'The output doesn\'t match my platform. What happened?',
    a: 'Make sure you have the correct platform selected (LinkedIn, Twitter/X, Blog, or Email) before running the pipeline. The formatting step applies platform-specific rules based on your selection.',
  },
];

export default function Support() {
  return (
    <div className="min-h-screen bg-background text-on-surface font-body">

      {/* Header */}
      <header className="w-full sticky top-0 bg-background/80 backdrop-blur-xl z-50">
        <nav className="flex items-center px-8 py-5 max-w-3xl mx-auto">
          <Link href="/" className="font-headline text-base font-semibold tracking-tight text-on-surface hover:text-primary transition-colors flex items-center gap-2">
            <span className="material-symbols-outlined text-2xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
            TaskFlow AI
          </Link>
        </nav>
      </header>

      {/* Content */}
      <main className="px-6 py-16 max-w-3xl mx-auto">
        <p className="font-label text-xs uppercase tracking-[0.3em] text-outline mb-4">Help</p>
        <h1 className="font-headline text-3xl font-bold tracking-tight text-on-surface mb-2">Support</h1>
        <p className="text-on-surface-variant text-sm mb-12 leading-relaxed max-w-lg">
          Answers to common questions about the pipeline, preferences, and data. Can't find what you need? Use the contact form below.
        </p>

        {/* FAQ */}
        <div className="flex flex-col gap-3 mb-16">
          {FAQS.map((faq, i) => (
            <div key={i} className="bg-surface-container rounded-xl px-5 py-4">
              <p className="font-headline text-sm font-semibold text-on-surface mb-2">{faq.q}</p>
              <p className="text-on-surface-variant text-sm leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>

        {/* Contact */}
        <div className="bg-surface-container-low rounded-2xl p-6 md:p-8">
          <h2 className="font-headline text-base font-semibold text-on-surface mb-1">Still need help?</h2>
          <p className="text-on-surface-variant text-sm mb-6">Send us a message and we'll get back to you.</p>
          <div className="flex flex-col gap-3">
            <input
              type="text"
              placeholder="Your name"
              className="w-full bg-surface-container-highest rounded-lg px-4 py-2.5 font-body text-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-1 focus:ring-primary/30 border-none"
            />
            <input
              type="email"
              placeholder="Your email"
              className="w-full bg-surface-container-highest rounded-lg px-4 py-2.5 font-body text-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-1 focus:ring-primary/30 border-none"
            />
            <textarea
              rows={4}
              placeholder="Describe your issue..."
              className="w-full bg-surface-container-highest rounded-lg px-4 py-2.5 font-body text-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-1 focus:ring-primary/30 border-none resize-none leading-relaxed"
            />
            <button className="primary-gradient text-on-primary font-label font-semibold text-sm px-6 py-2.5 rounded-full self-start hover:scale-105 active:scale-95 transition-transform">
              Send Message
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-10 max-w-3xl mx-auto flex items-center justify-between border-t border-outline-variant/20 mt-10">
        <span className="font-label text-xs text-on-surface-variant/40">© 2026 TaskFlow AI</span>
        <div className="flex gap-6 font-label text-xs text-on-surface-variant/50">
          <Link href="/privacy" className="hover:text-on-surface-variant transition-colors">Privacy</Link>
          <Link href="/terms" className="hover:text-on-surface-variant transition-colors">Terms</Link>
        </div>
      </footer>

    </div>
  );
}
