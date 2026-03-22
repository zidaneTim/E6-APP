/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, 
  Send, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  ArrowRight,
  RefreshCcw,
  BookOpen
} from 'lucide-react';
import Markdown from 'react-markdown';
import { analyzeReport } from './services/gemini';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [reportText, setReportText] = useState('');
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const handleAnalyze = async () => {
    if (!reportText.trim()) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const result = await analyzeReport(reportText);
      if (result) {
        setAnalysis(result);
        setTimeout(() => {
          resultRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        throw new Error("L'analyse n'a pas pu être générée.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue lors de l'analyse.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setReportText('');
    setAnalysis(null);
    setError(null);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-black/5 py-6 px-4 sticky top-0 z-10 backdrop-blur-md bg-white/80">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white">
              <BookOpen size={24} />
            </div>
            <div>
              <h1 className="font-serif text-xl font-bold tracking-tight">Assistant E6 SAPAT</h1>
              <p className="text-[10px] uppercase tracking-widest text-black/40 font-semibold">Expert MP6 & Référentiel MASA</p>
            </div>
          </div>
          {analysis && (
            <button 
              onClick={reset}
              className="flex items-center gap-2 text-xs font-medium text-black/60 hover:text-black transition-colors"
            >
              <RefreshCcw size={14} />
              Nouvelle analyse
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full p-4 md:p-8 space-y-12">
        {/* Intro Section */}
        {!analysis && (
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-4 py-8"
          >
            <h2 className="text-4xl md:text-5xl font-serif font-bold leading-tight">
              Transforme ton rapport <br /> en une <span className="italic text-black/60">analyse experte</span>.
            </h2>
            <p className="text-black/60 max-w-xl mx-auto text-lg">
              Colle ton brouillon ou ton rapport d'intervention ci-dessous. 
              Je l'analyserai selon les critères officiels de l'épreuve E6.
            </p>
          </motion.section>
        )}

        {/* Input Section */}
        <AnimatePresence mode="wait">
          {!analysis ? (
            <motion.section 
              key="input"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-6"
            >
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-black/5 to-black/10 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden">
                  <textarea
                    value={reportText}
                    onChange={(e) => setReportText(e.target.value)}
                    placeholder="Colle ici ton texte (ex: 'J'ai aidé Mme X à se lever...')"
                    className="w-full h-64 md:h-96 p-6 md:p-8 focus:outline-none resize-none font-sans text-lg leading-relaxed placeholder:text-black/20"
                  />
                  <div className="bg-black/5 px-6 py-4 flex items-center justify-between border-t border-black/5">
                    <div className="flex items-center gap-2 text-xs text-black/40 font-medium">
                      <FileText size={14} />
                      {reportText.length} caractères
                    </div>
                    <button
                      onClick={handleAnalyze}
                      disabled={isLoading || !reportText.trim()}
                      className={cn(
                        "flex items-center gap-2 px-6 py-2.5 rounded-full font-medium transition-all duration-300",
                        isLoading || !reportText.trim() 
                          ? "bg-black/10 text-black/30 cursor-not-allowed" 
                          : "bg-black text-white hover:scale-105 active:scale-95 shadow-lg shadow-black/10"
                      )}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          Analyse en cours...
                        </>
                      ) : (
                        <>
                          Lancer l'analyse
                          <ArrowRight size={18} />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl flex items-start gap-3"
                >
                  <AlertCircle size={20} className="shrink-0 mt-0.5" />
                  <p className="text-sm font-medium">{error}</p>
                </motion.div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { icon: <CheckCircle2 size={18} />, title: "Grille MASA", desc: "Conformité aux critères C6.1 et C6.2" },
                  { icon: <Sparkles size={18} />, title: "Reformulation", desc: "Passer de la description à l'analyse" },
                  { icon: <AlertCircle size={18} />, title: "Points de vigilance", desc: "Sécurité, coordination et territoire" }
                ].map((item, i) => (
                  <div key={i} className="bg-white/50 border border-black/5 p-4 rounded-2xl flex flex-col gap-2">
                    <div className="text-black/40">{item.icon}</div>
                    <h3 className="font-semibold text-sm">{item.title}</h3>
                    <p className="text-xs text-black/50">{item.desc}</p>
                  </div>
                ))}
              </div>
            </motion.section>
          ) : (
            <motion.section 
              key="result"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
              ref={resultRef}
            >
              <div className="bg-white border border-black/5 rounded-3xl p-8 md:p-12 shadow-xl shadow-black/5 relative overflow-hidden">
                {/* Decorative element */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-black/5 rounded-bl-full -mr-16 -mt-16" />
                
                <div className="markdown-body">
                  <Markdown>{analysis}</Markdown>
                </div>

                <div className="mt-12 pt-8 border-t border-black/5 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#f5f5f0] rounded-full flex items-center justify-center text-black/60">
                      <Sparkles size={24} />
                    </div>
                    <div>
                      <p className="font-serif italic text-lg">Prêt pour la suite ?</p>
                      <p className="text-xs text-black/40 font-medium uppercase tracking-wider">Prends en compte ces conseils pour ton dossier final.</p>
                    </div>
                  </div>
                  <button 
                    onClick={reset}
                    className="w-full md:w-auto px-8 py-3 bg-black text-white rounded-full font-medium hover:scale-105 transition-transform active:scale-95"
                  >
                    Analyser un autre texte
                  </button>
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-black/5 text-center space-y-4 bg-white/50">
        <p className="text-xs font-medium text-black/30 uppercase tracking-[0.2em]">
          Outil pédagogique • Bac Pro SAPAT • Épreuve E6
        </p>
        <div className="flex items-center justify-center gap-6 text-black/20">
          <span className="text-[10px] font-bold">MINISTÈRE DE L'AGRICULTURE</span>
          <span className="text-[10px] font-bold">RÉFÉRENTIEL MASA</span>
          <span className="text-[10px] font-bold">MODULE MP6</span>
        </div>
      </footer>
    </div>
  );
}
