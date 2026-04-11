"use client";

import { useState, useEffect } from 'react';
import { X, User, Sliders, Check } from 'lucide-react';

const TONES = ['Formal', 'Casual', 'Witty', 'Authoritative'];
const STYLES = ['Storytelling', 'Bullet-heavy', 'Data-driven', 'Conversational'];
const AUDIENCES = ['B2B', 'Students', 'General Public', 'Tech Folks'];

function PillGroup({ options, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(value === opt ? '' : opt)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
            value === opt
              ? 'bg-emerald-500 text-emerald-950 border-emerald-500'
              : 'bg-neutral-900 text-neutral-400 border-neutral-700 hover:border-neutral-500 hover:text-neutral-200'
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

export default function PersonalizationSidebar({ isOpen, onClose, onSave }) {
  // Profile state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [profile, setProfile] = useState(null);

  // Preferences state
  const [tone, setTone] = useState('');
  const [style, setStyle] = useState('');
  const [audience, setAudience] = useState('');
  const [customInstructions, setCustomInstructions] = useState('');
  const [saved, setSaved] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const storedProfile = JSON.parse(localStorage.getItem('taskflow_profile') || 'null');
      if (storedProfile) {
        setProfile(storedProfile);
        setName(storedProfile.name || '');
        setEmail(storedProfile.email || '');
      }
      const storedPrefs = JSON.parse(localStorage.getItem('taskflow_prefs') || 'null');
      if (storedPrefs) {
        setTone(storedPrefs.tone || '');
        setStyle(storedPrefs.style || '');
        setAudience(storedPrefs.audience || '');
        setCustomInstructions(storedPrefs.customInstructions || '');
      }
    } catch {}
  }, []);

  const handleSaveProfile = () => {
    const p = { name, email };
    localStorage.setItem('taskflow_profile', JSON.stringify(p));
    setProfile(p);
  };

  const handleClearProfile = () => {
    localStorage.removeItem('taskflow_profile');
    setProfile(null);
    setName('');
    setEmail('');
  };

  const handleSavePrefs = () => {
    const prefs = { tone, style, audience, customInstructions };
    localStorage.setItem('taskflow_prefs', JSON.stringify(prefs));
    onSave(prefs);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-neutral-950 border-l border-neutral-800 z-50 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold text-neutral-200 text-sm">Personalization</span>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-neutral-500 hover:text-neutral-200 hover:bg-neutral-800 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-6">

          {/* ── Profile section ─────────────────────────────────────────────── */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <User className="w-3.5 h-3.5 text-neutral-500" />
              <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Profile</span>
            </div>

            {profile && (
              <div className="flex items-center justify-between mb-3 px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                <span className="text-xs text-emerald-400 font-medium truncate">
                  {profile.name || profile.email || 'Logged in'}
                </span>
                <button
                  onClick={handleClearProfile}
                  className="text-[11px] text-neutral-500 hover:text-red-400 transition-colors ml-2 flex-shrink-0"
                >
                  Clear
                </button>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name"
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
              />
              <button
                onClick={handleSaveProfile}
                disabled={!name.trim() && !email.trim()}
                className="w-full py-2 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 hover:border-neutral-600 text-neutral-300 text-xs font-medium rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Save Profile
              </button>
            </div>
          </div>

          <div className="border-t border-neutral-800/60" />

          {/* ── Writing Preferences ──────────────────────────────────────────── */}
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-2">
              <Sliders className="w-3.5 h-3.5 text-neutral-500" />
              <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Writing Preferences</span>
            </div>

            <div>
              <p className="text-xs text-neutral-500 mb-2 font-medium">Tone</p>
              <PillGroup options={TONES} value={tone} onChange={setTone} />
            </div>

            <div>
              <p className="text-xs text-neutral-500 mb-2 font-medium">Writing Style</p>
              <PillGroup options={STYLES} value={style} onChange={setStyle} />
            </div>

            <div>
              <p className="text-xs text-neutral-500 mb-2 font-medium">Audience</p>
              <PillGroup options={AUDIENCES} value={audience} onChange={setAudience} />
            </div>

            <div>
              <p className="text-xs text-neutral-500 mb-2 font-medium">Custom Instructions</p>
              <textarea
                value={customInstructions}
                onChange={(e) => setCustomInstructions(e.target.value)}
                rows={3}
                placeholder="Any other preferences? e.g. 'Always use short sentences' or 'Avoid jargon'"
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all resize-none leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* Save button — pinned to bottom */}
        <div className="flex-shrink-0 px-5 py-4 border-t border-neutral-800">
          <button
            onClick={handleSavePrefs}
            className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-semibold text-sm rounded-xl transition-all flex items-center justify-center gap-2"
          >
            {saved ? (
              <>
                <Check className="w-4 h-4" />
                Saved
              </>
            ) : (
              'Save Preferences'
            )}
          </button>
        </div>
      </div>
    </>
  );
}
