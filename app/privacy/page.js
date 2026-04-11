import Link from 'next/link';

export const metadata = { title: 'Privacy Policy — TaskFlow AI' };

export default function Privacy() {
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
        <p className="font-label text-xs uppercase tracking-[0.3em] text-outline mb-4">Legal</p>
        <h1 className="font-headline text-3xl font-bold tracking-tight text-on-surface mb-2">Privacy Policy</h1>
        <p className="font-label text-xs text-on-surface-variant mb-12">Last updated: April 2026</p>

        <div className="flex flex-col gap-10">

          <section>
            <h2 className="font-headline text-base font-semibold text-on-surface mb-3">What We Collect</h2>
            <p className="text-on-surface-variant leading-relaxed text-sm">
              TaskFlow AI stores your writing preferences (tone, style, audience, custom instructions) and optional profile information (name, email) exclusively in your browser&apos;s <code className="font-mono text-xs bg-surface-container-highest px-1.5 py-0.5 rounded text-primary">localStorage</code>. No data is transmitted to or stored on our servers. Your content goals and generated outputs exist only in your browser session and are discarded when you close the tab.
            </p>
          </section>

          <section>
            <h2 className="font-headline text-base font-semibold text-on-surface mb-3">Third-Party Services</h2>
            <p className="text-on-surface-variant leading-relaxed text-sm">
              Content generation is powered by the Oxlo API (model: deepseek-v3-0324). Web research is performed via the Tavily search API. Your content goals are sent to these services as part of the pipeline execution. Please review their respective privacy policies for how they handle data.
            </p>
          </section>

          <section>
            <h2 className="font-headline text-base font-semibold text-on-surface mb-3">Cookies & Tracking</h2>
            <p className="text-on-surface-variant leading-relaxed text-sm">
              We do not use cookies, analytics trackers, or any form of behavioral tracking. There are no third-party advertising scripts on this platform.
            </p>
          </section>

          <section>
            <h2 className="font-headline text-base font-semibold text-on-surface mb-3">Data Deletion</h2>
            <p className="text-on-surface-variant leading-relaxed text-sm">
              To remove all stored data, open your browser&apos;s developer tools, navigate to Application → Local Storage, and delete the keys <code className="font-mono text-xs bg-surface-container-highest px-1.5 py-0.5 rounded text-primary">taskflow_prefs</code> and <code className="font-mono text-xs bg-surface-container-highest px-1.5 py-0.5 rounded text-primary">taskflow_profile</code>. Alternatively, use the &ldquo;Clear&rdquo; option in the personalization sidebar.
            </p>
          </section>

          <section>
            <h2 className="font-headline text-base font-semibold text-on-surface mb-3">Contact</h2>
            <p className="text-on-surface-variant leading-relaxed text-sm">
              Questions about this policy? Reach out via the <Link href="/support" className="text-primary hover:underline">Support page</Link>.
            </p>
          </section>

        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-10 max-w-3xl mx-auto flex items-center justify-between border-t border-outline-variant/20 mt-10">
        <span className="font-label text-xs text-on-surface-variant/40">© 2026 TaskFlow AI</span>
        <div className="flex gap-6 font-label text-xs text-on-surface-variant/50">
          <Link href="/terms" className="hover:text-on-surface-variant transition-colors">Terms</Link>
          <Link href="/support" className="hover:text-on-surface-variant transition-colors">Support</Link>
        </div>
      </footer>

    </div>
  );
}
