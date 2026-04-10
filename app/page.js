"use client";

import { useState } from 'react';
import { Loader2, Zap, LayoutList, Terminal, ChevronRight, CheckCircle2 } from 'lucide-react';

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  
  const examplePrompts = [
    "Plan my Saturday with outdoor activities",
    "Learn Golang in 30 days syllabus",
    "Start a YouTube channel step-by-step"
  ];

  const handleExampleClick = (text) => {
    setPrompt(text);
  };

  const fakeDelay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const executeTask = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsExecuting(true);
    setResult(null);
    setError(null);
    setCurrentStep(1); // Start intent detection

    // Simulate animated steps for UI
    const stepInterval = setInterval(() => {
      setCurrentStep(prev => prev < 3 ? prev + 1 : prev);
    }, 1500);

    try {
      const response = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });

      clearInterval(stepInterval);
      setCurrentStep(3); // Output generation done

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Execution failed.');
      }

      await fakeDelay(500); // final delay before showing result
      setResult(data);
      setCurrentStep(4); // Finished
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred.');
      clearInterval(stepInterval);
      setCurrentStep(0);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-50 font-sans selection:bg-emerald-500 selection:text-white">
      <div className="max-w-6xl mx-auto px-6 py-12 md:py-24">
        
        <header className="mb-12 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-emerald-400 to-cyan-500 bg-clip-text text-transparent inline-flex items-center gap-3">
              <Zap className="w-8 h-8 text-emerald-400" />
              TaskFlow AI
            </h1>
            <p className="text-neutral-400 mt-2 text-lg">Convert intent into structured, multi-step actions.</p>
          </div>
          <div className="hidden md:flex items-center gap-2 text-sm text-neutral-500 bg-neutral-900 px-4 py-2 rounded-full border border-neutral-800">
            <LayoutList className="w-4 h-4" />
            <span>Structured Output Engine</span>
          </div>
        </header>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-16">
          
          {/* Left Column: Input */}
          <section className="flex flex-col gap-8">
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-2xl">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-neutral-200">
                <Terminal className="w-5 h-5 text-emerald-500" />
                Define Your Intent
              </h2>
              
              <form onSubmit={executeTask} className="flex flex-col gap-4">
                <textarea 
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="What would you like to accomplish?"
                  className="w-full h-32 bg-neutral-950 border border-neutral-800 rounded-xl p-4 text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 resize-none transition-all"
                  disabled={isExecuting}
                />
                
                <button
                  type="submit"
                  disabled={!prompt.trim() || isExecuting}
                  className="bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold py-3 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isExecuting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Executing Pipeline...
                    </>
                  ) : (
                    <>
                      Execute Task <ChevronRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>
            </div>

            <div>
              <h3 className="text-sm font-medium text-neutral-500 uppercase tracking-wider mb-4">Example Intents</h3>
              <div className="flex flex-col gap-3">
                {examplePrompts.map((text, i) => (
                  <button
                    key={i}
                    onClick={() => handleExampleClick(text)}
                    disabled={isExecuting}
                    className="text-left px-4 py-3 rounded-xl bg-neutral-900/50 hover:bg-neutral-800 border border-neutral-800/50 hover:border-neutral-700 text-neutral-300 transition-all text-sm truncate disabled:opacity-50"
                  >
                    {text}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Right Column: Execution & Output */}
          <section className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 md:p-8 flex flex-col relative overflow-hidden shadow-2xl">
            
            {/* Steps Progress */}
            {(isExecuting || currentStep > 0) && (
              <div className="mb-8 flex flex-col gap-4 relative z-10">
                <h3 className="text-sm font-medium text-neutral-500 uppercase tracking-wider mb-2">Execution Pipeline</h3>
                
                {[
                  { num: 1, label: "Intent Detection" },
                  { num: 2, label: "Task Planning" },
                  { num: 3, label: "Structured Output Generation" }
                ].map((step) => (
                  <div 
                    key={step.num}
                    className={`flex items-center gap-4 transition-all duration-500 ${currentStep >= step.num ? 'opacity-100' : 'opacity-40'} ${currentStep === step.num && isExecuting ? 'scale-105 origin-left' : ''}`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 
                      ${currentStep > step.num 
                        ? 'bg-emerald-500 border-emerald-500 text-emerald-950' 
                        : currentStep === step.num 
                          ? 'border-emerald-500 text-emerald-400' 
                          : 'border-neutral-700 text-neutral-600'}`
                    }>
                      {currentStep > step.num ? <CheckCircle2 className="w-5 h-5" /> : step.num}
                    </div>
                    <span className={`font-medium ${currentStep === step.num ? 'text-emerald-400' : 'text-neutral-400'}`}>
                      {step.label}
                      {currentStep === step.num && isExecuting && <span className="ml-2 animate-pulse">...</span>}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="mt-4 p-4 bg-red-950/30 border border-red-900/50 rounded-xl text-red-400 text-sm">
                Error formatting response: {error}
              </div>
            )}

            {/* Render Output */}
            {result && currentStep === 4 && (
              <div className="mt-6 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out border-t border-neutral-800 pt-8">
                
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">{result.result?.title || 'Execution Result'}</h2>
                  {result.meta && (
                    <div className="flex gap-4 text-xs font-mono text-neutral-500">
                      <span title="API Calls Used" className="bg-neutral-950 px-2 py-1 rounded">API: {result.meta.api_calls}</span>
                      <span title="Execution Time" className="bg-neutral-950 px-2 py-1 rounded">{result.meta.execution_time}</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-6">
                  {result.result?.sections?.map((section, idx) => (
                    <div key={idx} className="bg-neutral-950/50 p-5 rounded-xl border border-neutral-800">
                      <h4 className="text-emerald-400 font-semibold mb-3 pb-2 border-b border-neutral-800/50">
                        {section.heading}
                      </h4>
                      <ul className="flex flex-col gap-2">
                        {section.content?.map((point, pIdx) => (
                          <li key={pIdx} className="text-neutral-300 text-sm pl-4 relative before:absolute before:left-0 before:top-2 before:w-1.5 before:h-1.5 before:bg-emerald-500/50 before:rounded-full">
                            {point}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

              </div>
            )}

            {/* Empty State */}
            {!isExecuting && currentStep === 0 && !result && (
              <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50 p-12">
                <LayoutList className="w-16 h-16 text-neutral-700 mb-4" />
                <p className="text-neutral-500">Enter an intent to see the AI pipeline in action.</p>
              </div>
            )}

          </section>
        </div>
      </div>
    </main>
  );
}
