"use client";

import { useState, useEffect } from 'react';
import { X, User, Sliders, Check } from 'lucide-react';

const TONES     = ['Formal', 'Casual', 'Witty', 'Authoritative'];
const STYLES    = ['Storytelling', 'Bullet-heavy', 'Data-driven', 'Conversational'];
const AUDIENCES = ['B2B', 'Students', 'General Public', 'Tech Folks'];

function PillGroup({ options, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(value === opt ? '' : opt)}
          className={`font-label px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
            value === opt
              ? 'primary-gradient text-on-primary'
              : 'bg-surface-container-highest text-on-surface-variant hover:text-on-surface'
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

export default function PersonalizationSidebar({ isOpen, onClose, onSave }) {
  const [name, setName]                     = useState('');
  const [email, setEmail]                   = useState('');
  const [profile, setProfile]               = useState(null);
  const [tone, setTone]                     = useState('');
  const [style, setStyle]                   = useState('');
  const [audience, setAudience]             = useState('');
  const [customInstructions, setCustomInstructions] = useState('');
  const [saved, setSaved]                   = useState(false);

  useEffect(() => {
    try {
      const storedProfile = JSON.parse(localStorage.getItem('taskflow_profile') || 'null');
      if (storedProfile) { setProfile(storedProfile); setName(storedProfile.name || ''); setEmail(storedProfile.email || ''); }
      const storedPrefs = JSON.parse(localStorage.getItem('taskflow_prefs') || 'null');
      if (storedPrefs) { setTone(storedPrefs.tone || ''); setStyle(storedPrefs.style || ''); setAudience(storedPrefs.audience || ''); setCustomInstructions(storedPrefs.customInstructions || ''); }
    } catch {}
  }, []);

  const handleSaveProfile = () => {
    const p = { name, email };
    localStorage.setItem('taskflow_profile', JSON.stringify(p));
    setProfile(p);
  };

  const handleClearProfile = () => {
    localStorage.removeItem('taskflow_profile');
    setProfile(null); setName(''); setEmail('');
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
        className={`fixed inset-0 bg-background/70 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Panel — glassmorphism */}
      <div className={`fixed top-0 right-0 h-full w-80 bg-surface-container/80 backdrop-blur-2xl z-50 flex flex-col transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-surface-container-high/60 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-primary" />
            <span className="font-headline font-semibold text-on-surface text-sm tracking-tight">Personalization</span>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-6">

          {/* Profile */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <User className="w-3.5 h-3.5 text-on-surface-variant" />
              <span className="font-label text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Profile</span>
            </div>

            {profile && (
              <div className="flex items-center justify-between mb-3 px-3 py-2 bg-primary/10 rounded-lg">
                <span className="font-label text-xs text-primary truncate">{profile.name || profile.email || 'Logged in'}</span>
                <button onClick={handleClearProfile} className="font-label text-[11px] text-on-surface-variant hover:text-error transition-colors ml-2 flex-shrink-0">Clear</button>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name"
                className="w-full bg-surface-container-highest rounded-lg px-3 py-2 font-body text-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-1 focus:ring-primary/30 border-none transition-all"
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full bg-surface-container-highest rounded-lg px-3 py-2 font-body text-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-1 focus:ring-primary/30 border-none transition-all"
              />
              <button
                onClick={handleSaveProfile}
                disabled={!name.trim() && !email.trim()}
                className="w-full py-2 bg-surface-container-high hover:bg-surface-container-highest font-label text-on-surface-variant text-xs font-medium rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Save Profile
              </button>
            </div>
          </div>

          <div className="h-px bg-outline-variant/30" />

          {/* Preferences */}
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-2">
              <Sliders className="w-3.5 h-3.5 text-on-surface-variant" />
              <span className="font-label text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Writing Preferences</span>
            </div>

            <div>
              <p className="font-label text-xs text-on-surface-variant mb-2">Tone</p>
              <PillGroup options={TONES} value={tone} onChange={setTone} />
            </div>
            <div>
              <p className="font-label text-xs text-on-surface-variant mb-2">Writing Style</p>
              <PillGroup options={STYLES} value={style} onChange={setStyle} />
            </div>
            <div>
              <p className="font-label text-xs text-on-surface-variant mb-2">Audience</p>
              <PillGroup options={AUDIENCES} value={audience} onChange={setAudience} />
            </div>
            <div>
              <p className="font-label text-xs text-on-surface-variant mb-2">Custom Instructions</p>
              <textarea
                value={customInstructions}
                onChange={(e) => setCustomInstructions(e.target.value)}
                rows={3}
                placeholder="e.g. 'Always use short sentences' or 'Avoid jargon'"
                className="w-full bg-surface-container-highest rounded-lg px-3 py-2 font-body text-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-1 focus:ring-primary/30 border-none resize-none leading-relaxed transition-all"
              />
            </div>
          </div>
        </div>

        {/* Save — pinned bottom */}
        <div className="flex-shrink-0 px-5 py-4 bg-surface-container-high/60">
          <button
            onClick={handleSavePrefs}
            className="w-full py-2.5 primary-gradient text-on-primary font-label font-semibold text-sm rounded-full transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
          >
            {saved ? <><Check className="w-4 h-4" /> Saved</> : 'Save Preferences'}
          </button>
        </div>
      </div>
    </>
  );
}
