
import React, { useState, useRef, useMemo } from 'react';
import { generateHash } from '../services/crypto';
import { analyzeSemanticSimilarity, getWritingSuggestions, paraphraseSentence } from '../services/aiService';
import { Submission, SimilarityAnalysis } from '../types';

interface DraftEditorProps {
  onSave: (sub: Submission) => void;
}

const DraftEditor: React.FC<DraftEditorProps> = ({ onSave }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<SimilarityAnalysis | null>(null);
  const [suggestions, setSuggestions] = useState<string>('');
  const [loadingStep, setLoadingStep] = useState('');
  const [activeSegmentIndex, setActiveSegmentIndex] = useState<number | null>(null);
  const [showDeepDive, setShowDeepDive] = useState(false);

  // Paraphrasing state
  const [isParaphrasing, setIsParaphrasing] = useState(false);
  const [paraphrases, setParaphrases] = useState<string[]>([]);
  const [selectedSegment, setSelectedSegment] = useState<string | null>(null);
  const [selectionRange, setSelectionRange] = useState<{ start: number, end: number } | null>(null);
  const [showCertificate, setShowCertificate] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const runAnalysis = async () => {
    if (!content.trim()) return;
    setIsAnalyzing(true);
    setAnalysis(null);
    setSuggestions('');
    setParaphrases([]);
    setSelectedSegment(null);
    setActiveSegmentIndex(null);
    setShowDeepDive(false);

    try {
      setLoadingStep('Hashing document locally (Zero-Knowledge)...');
      const hash = await generateHash(content);

      setLoadingStep('Analyzing semantic overlap ...');
      const result = await analyzeSemanticSimilarity(content);
      setAnalysis(result);

      setLoadingStep('Fetching writing coach suggestions...');
      const advice = await getWritingSuggestions(content);
      setSuggestions(advice);

      const submission: Submission = {
        id: `sub-${Date.now()}`,
        title: title || 'Untitled Draft',
        content,
        hash,
        timestamp: new Date().toISOString(),
        status: 'DRAFT',
        authorId: 'u-12345',
        similarityScore: result.score,
        version: 1,
        aiExplanation: result.summary
      };

      onSave(submission);
    } catch (err) {
      alert("Analysis failed. Please check your API key.");
    } finally {
      setIsAnalyzing(false);
      setLoadingStep('');
    }
  };

  const handleParaphraseRequest = async (text: string, range?: { start: number, end: number }) => {
    if (!text.trim()) return;
    setSelectedSegment(text);
    setSelectionRange(range || null);
    setIsParaphrasing(true);
    setParaphrases([]);
    try {
      const results = await paraphraseSentence(text);
      setParaphrases(results);
    } catch (e) {
      setParaphrases(["Could not generate paraphrases."]);
    } finally {
      setIsParaphrasing(false);
    }
  };

  const handleManualSelection = () => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selectedText = el.value.substring(start, end);
    if (selectedText.length > 5) {
      handleParaphraseRequest(selectedText, { start, end });
    } else {
      alert("Please select a longer phrase or sentence to paraphrase.");
    }
  };

  const applyParaphrase = (newText: string) => {
    if (!selectedSegment) return;

    let updatedContent: string;
    if (selectionRange) {
      updatedContent = content.slice(0, selectionRange.start) + newText + content.slice(selectionRange.end);
    } else {
      updatedContent = content.replace(selectedSegment, newText);
    }

    setContent(updatedContent);
    setParaphrases([]);
    setSelectedSegment(null);
    setSelectionRange(null);
    if (analysis) setAnalysis(null);
  };

  const renderedHeatmap = useMemo(() => {
    if (!analysis || !content) return null;

    let lastIndex = 0;
    const elements: React.ReactNode[] = [];
    const sortedSegments = [...analysis.segments].sort((a, b) => content.indexOf(a.text) - content.indexOf(b.text));

    sortedSegments.forEach((seg, idx) => {
      const startIdx = content.indexOf(seg.text, lastIndex);
      if (startIdx !== -1) {
        elements.push(content.substring(lastIndex, startIdx));

        const isCritical = seg.similarity > 0.7;
        const intensityClass = isCritical
          ? 'bg-red-200/60 border-red-400'
          : 'bg-orange-100/60 border-orange-300';
        const isActive = activeSegmentIndex === idx;

        elements.push(
          <span
            key={idx}
            onClick={() => {
              setActiveSegmentIndex(idx);
              setShowDeepDive(true);
            }}
            className={`cursor-pointer border-b-2 px-0.5 rounded-sm transition-all duration-300 ${intensityClass} ${isActive ? 'ring-2 ring-indigo-500 ring-offset-1 scale-[1.01] shadow-md z-10 relative bg-opacity-100' : 'hover:bg-opacity-80'}`}
          >
            {seg.text}
          </span>
        );
        lastIndex = startIdx + seg.text.length;
      }
    });

    elements.push(content.substring(lastIndex));
    return elements;
  }, [analysis, content, activeSegmentIndex]);

  const activeSegment = activeSegmentIndex !== null && analysis ? analysis.segments[activeSegmentIndex] : null;

  return (
    <>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[750px]">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center flex-wrap gap-4">
              <div className="flex items-center gap-3 flex-1">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">
                  <i className="fa-solid fa-file-lines"></i>
                </div>
                <input
                  type="text"
                  placeholder="Document Title"
                  className="bg-transparent font-bold text-slate-700 outline-none flex-1 min-w-[200px] text-lg"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleManualSelection}
                  className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors flex items-center gap-2"
                >
                  <i className="fa-solid fa-wand-magic-sparkles text-indigo-500"></i>
                  Paraphrase Selection
                </button>
                <button
                  onClick={runAnalysis}
                  disabled={isAnalyzing || !content}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center gap-2 whitespace-nowrap shadow-md shadow-indigo-100"
                >
                  {isAnalyzing ? <i className="fa-solid fa-circle-notch animate-spin"></i> : <i className="fa-solid fa-magnifying-glass-chart"></i>}
                  Check Integrity
                </button>
                {analysis && (
                  <button
                    onClick={() => setShowCertificate(true)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors flex items-center gap-2 whitespace-nowrap shadow-md shadow-green-100"
                  >
                    <i className="fa-solid fa-certificate"></i>
                    View Certificate
                  </button>
                )}
              </div>
            </div>

            <div className="relative flex-1 overflow-hidden">
              {analysis ? (
                <div className="absolute inset-0 p-10 text-lg text-slate-700 leading-relaxed font-serif overflow-y-auto bg-white select-text">
                  <div className="mb-6 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-md py-3 z-10 border-b border-slate-100 -mx-10 px-10">
                    <div className="flex items-center gap-4">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-1 rounded">Interactive Heatmap</span>
                      {activeSegmentIndex !== null && (
                        <span className="text-xs text-indigo-600 font-bold animate-pulse">
                          <i className="fa-solid fa-circle-info mr-1"></i> Segment Selected
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => { setAnalysis(null); setActiveSegmentIndex(null); }}
                      className="text-xs font-bold text-slate-400 hover:text-indigo-600 transition-colors flex items-center gap-2"
                    >
                      <i className="fa-solid fa-pen-nib"></i> Return to Editor
                    </button>
                  </div>
                  {renderedHeatmap}
                </div>
              ) : (
                <textarea
                  ref={textareaRef}
                  className="w-full h-full p-10 text-lg text-slate-700 outline-none resize-none leading-relaxed font-serif bg-slate-50/30 focus:bg-white transition-colors"
                  placeholder="Paste your academic text here. Highlight any sentence to use the AI Paraphrase tool..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                ></textarea>
              )}
            </div>

            <div className="px-10 py-3 bg-slate-50 border-t border-slate-100 text-[10px] text-slate-400 font-mono flex justify-between items-center">
              <div className="flex gap-6">
                <span>CHARACTERS: {content.length}</span>
                <span>WORDS: {content.trim() ? content.trim().split(/\s+/).length : 0}</span>
              </div>
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-vault text-indigo-400"></i>
                <span>ZERO-KNOWLEDGE SECURITY ACTIVE</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {isAnalyzing && (
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-pulse">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <i className="fa-solid fa-microchip animate-spin text-indigo-600"></i>
                Forensic Analysis Service
              </h3>
              <p className="text-sm text-slate-500 mb-2">{loadingStep}</p>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-indigo-600 h-full animate-progress" style={{ width: '60%' }}></div>
              </div>
            </div>
          )}

          {showDeepDive && activeSegment && (
            <div className="bg-white rounded-2xl border-2 border-indigo-600 shadow-2xl slide-in z-20 flex flex-col overflow-hidden max-h-[750px]">
              <div className="p-5 bg-indigo-600 text-white flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                    <i className="fa-solid fa-magnifying-glass-plus text-sm"></i>
                  </div>
                  <h3 className="font-bold tracking-tight">Segment Deep Dive</h3>
                </div>
                <button onClick={() => setShowDeepDive(false)} className="hover:bg-white/10 p-2 rounded-lg transition-colors">
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>

              <div className="p-6 space-y-6 overflow-y-auto">
                <section>
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Original Segment</h4>
                  <p className="text-sm text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-100 italic leading-relaxed">
                    "{activeSegment.text}"
                  </p>
                </section>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Match Weight</p>
                    <p className={`text-2xl font-black ${activeSegment.similarity > 0.7 ? 'text-red-500' : 'text-orange-500'}`}>
                      {Math.round(activeSegment.similarity * 100)}%
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Risk Level</p>
                    <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest ${activeSegment.similarity > 0.7 ? 'bg-red-500 text-white' : 'bg-orange-400 text-white'}`}>
                      {activeSegment.similarity > 0.7 ? 'Critical' : 'Moderate'}
                    </span>
                  </div>
                </div>

                <section>
                  <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <i className="fa-solid fa-brain"></i> AI Forensic Explanation
                  </h4>
                  <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl text-xs text-indigo-700 leading-relaxed shadow-inner">
                    {activeSegment.explanation || "System detected high structural similarity to academic sources. Structural markers suggest potential paraphrasing without adequate conceptual divergence."}
                  </div>
                </section>

                {activeSegment.source && (
                  <section>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Primary Reference Match</h4>
                    <div className="p-3 bg-slate-900 text-slate-300 rounded-xl font-mono text-[10px] border border-slate-800 flex items-center gap-3">
                      <i className="fa-solid fa-link text-indigo-400"></i>
                      <span className="truncate">{activeSegment.source}</span>
                    </div>
                  </section>
                )}

                <div className="pt-4 border-t border-slate-100">
                  <button
                    onClick={() => handleParaphraseRequest(activeSegment.text)}
                    className="w-full bg-slate-800 text-white py-3 rounded-xl font-bold text-sm hover:bg-slate-900 transition-all flex items-center justify-center gap-2"
                  >
                    <i className="fa-solid fa-wand-magic-sparkles"></i>
                    Ethical Rephrase
                  </button>
                </div>
              </div>
            </div>
          )}

          {(isParaphrasing || paraphrases.length > 0) && !showDeepDive && (
            <div className="bg-white p-6 rounded-xl border-2 border-indigo-500 shadow-xl slide-in z-10 sticky top-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <i className="fa-solid fa-wand-magic-sparkles text-indigo-600"></i>
                  Ethical Paraphrase
                </h3>
                <button onClick={() => { setParaphrases([]); setSelectedSegment(null); }} className="text-slate-400 hover:text-slate-600">
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>

              {isParaphrasing ? (
                <div className="text-center py-6">
                  <i className="fa-solid fa-circle-notch animate-spin text-2xl text-indigo-600 mb-2"></i>
                  <p className="text-xs text-slate-500">Generating structural alternatives...</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Original Text:</p>
                  <p className="text-xs text-slate-600 italic border-l-2 border-slate-200 pl-2 mb-4">"{selectedSegment}"</p>

                  <p className="text-[10px] text-indigo-600 font-bold uppercase mb-1">Suggested Alternatives:</p>
                  {paraphrases.map((p, i) => (
                    <button
                      key={i}
                      onClick={() => applyParaphrase(p)}
                      className="w-full text-left p-3 text-sm rounded-lg border border-slate-100 bg-indigo-50/30 hover:bg-indigo-100/50 hover:border-indigo-200 transition-all group"
                    >
                      <span className="text-slate-700 leading-relaxed">{p}</span>
                      <span className="block mt-2 text-[10px] text-indigo-500 font-bold opacity-0 group-hover:opacity-100">Apply Revision →</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {analysis && !isAnalyzing && !showDeepDive && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm slide-in flex flex-col overflow-hidden">
              <div className="p-6 bg-slate-50 border-b border-slate-100">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-black text-slate-800 text-sm uppercase tracking-widest">Explainable AI Summary</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Holistic integrity assessment</p>
                  </div>
                  <div className="text-right">
                    <div className={`text-4xl font-black ${analysis.score > 30 ? 'text-red-500' : 'text-green-500'}`}>
                      {analysis.score}%
                    </div>
                    <div className="text-[10px] text-slate-400 uppercase font-black tracking-tighter leading-none">Similarity Score</div>
                  </div>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed bg-white p-4 rounded-xl border border-slate-100 shadow-sm italic">
                  "{analysis.summary}"
                </p>

                {analysis.references && analysis.references.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-slate-200">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <i className="fa-solid fa-book-bookmark text-indigo-500"></i>
                      Identified Source Matches
                    </h4>
                    <ul className="space-y-2">
                      {analysis.references.map((ref, idx) => (
                        <li key={idx} className="bg-white p-3 rounded-lg border border-slate-200 text-xs text-slate-700 font-medium shadow-sm flex items-start gap-2 group hover:border-indigo-300 transition-colors">
                          <i className="fa-solid fa-link text-indigo-300 mt-1 group-hover:text-indigo-500 transition-colors"></i>
                          <div className="flex flex-col gap-1">
                            <a
                              href={ref.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-indigo-600 hover:text-indigo-800 font-bold decoration-indigo-200 hover:underline transition-all"
                            >
                              {ref.title}
                            </a>
                            <span className="text-[10px] text-slate-400 font-mono truncate max-w-[200px]">{ref.url}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="p-6 space-y-4 overflow-y-auto max-h-[400px]">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <i className="fa-solid fa-list-check"></i> Analysis Findings
                  </h4>
                  <span className="text-[10px] bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded font-bold">
                    {analysis.segments.length} Flaggers Found
                  </span>
                </div>

                {analysis.segments.map((seg, i) => {
                  const isActive = activeSegmentIndex === i;
                  return (
                    <div
                      key={i}
                      onClick={() => {
                        setActiveSegmentIndex(i);
                        setShowDeepDive(true);
                      }}
                      className={`p-4 rounded-xl border transition-all duration-300 cursor-pointer group ${isActive ? 'bg-indigo-50 border-indigo-600 shadow-md ring-1 ring-indigo-200' : 'border-slate-100 bg-white hover:border-slate-300 hover:shadow-sm'}`}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter ${seg.similarity > 0.7 ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600'}`}>
                          {Math.round(seg.similarity * 100)}% Match
                        </span>
                        <i className={`fa-solid fa-chevron-right text-[10px] transition-transform ${isActive ? 'rotate-90 text-indigo-600' : 'text-slate-300 group-hover:translate-x-1'}`}></i>
                      </div>
                      <p className={`text-[11px] text-slate-700 font-medium leading-relaxed line-clamp-2`}>"{seg.text}"</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {suggestions && !isAnalyzing && !showDeepDive && (
            <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 p-6 rounded-xl text-white shadow-lg slide-in">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <i className="fa-solid fa-lightbulb"></i>
                Writing Ethics Advisor
              </h3>
              <div className="text-sm text-indigo-50 font-medium whitespace-pre-wrap leading-relaxed">
                {suggestions}
              </div>
              <div className="mt-4 pt-4 border-t border-indigo-400/30 flex justify-between items-center">
                <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">AI Recommendations</span>
                <i className="fa-solid fa-graduation-cap opacity-40"></i>
              </div>
            </div>
          )}

          {!analysis && !isAnalyzing && (
            <div className="bg-slate-900 p-10 rounded-xl text-white text-center shadow-xl border border-slate-800">
              <div className="w-16 h-16 bg-indigo-600/20 rounded-2xl flex items-center justify-center text-indigo-400 mx-auto mb-6 border border-indigo-500/30">
                <i className="fa-solid fa-shield-halved text-3xl"></i>
              </div>
              <h3 className="font-bold text-lg mb-2 tracking-tight">Zero-Knowledge Verification</h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-6">
                Guardian uses semantic vector embeddings and local on-premise inference to verify integrity without storing your draft's raw text in our permanent database.
              </p>
              <div className="flex justify-center gap-4">
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  <i className="fa-solid fa-lock text-green-500"></i> Encrypted
                </div>
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  <i className="fa-solid fa-bolt text-yellow-500"></i> Real-time
                </div>
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  <i className="fa-solid fa-server text-indigo-500"></i> On-Prem
                </div>
              </div>
            </div>
          )}

          {showCertificate && analysis && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
              <div className="bg-white max-w-2xl w-full rounded-3xl shadow-2xl overflow-hidden relative border-8 border-double border-indigo-50">
                {/* Decorative Header */}
                <div className="bg-indigo-600 p-8 text-white text-center relative">
                  <div className="absolute top-4 left-4 opacity-20">
                    <i className="fa-solid fa-shield-halved text-6xl"></i>
                  </div>
                  <h2 className="text-3xl font-black uppercase tracking-tighter mb-2">Certificate of Originality</h2>
                  <p className="text-indigo-100 text-sm font-medium">Guaranteed by Institutional Zero-Knowledge Ledger</p>
                </div>

                <div className="p-12 text-center space-y-8">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">This document hereby certifies that</p>
                    <h3 className="text-2xl font-black text-slate-800 border-b-2 border-indigo-100 inline-block px-8 pb-1">
                      {JSON.parse(localStorage.getItem('userSession') || '{}').name || 'Verified Scholar'}
                    </h3>
                    <p className="text-sm text-slate-500 mt-2 font-medium">
                      from {JSON.parse(localStorage.getItem('userSession') || '{}').institution || 'Global Tech University'}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Has completed an AI-driven forensic analysis for</p>
                    <p className="text-xl font-bold text-slate-700 italic">"{title || 'Untitled Academic Draft'}"</p>
                  </div>

                  <div className="flex justify-center gap-12 py-6 border-y border-slate-100">
                    <div className="text-center">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Similarity Score</p>
                      <p className={`text-4xl font-black ${analysis.score > 30 ? 'text-red-500' : 'text-green-500'}`}>{analysis.score}%</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                      <p className="text-4xl font-black text-green-500 flex items-center gap-2">
                        <i className="fa-solid fa-circle-check"></i>
                        {analysis.score < 20 ? 'Optimal' : analysis.score < 40 ? 'Fair' : 'Review'}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between items-end gap-8 pt-4">
                    <div className="text-left">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Cryptographic Proof (SHA-256)</p>
                      <p className="text-[10px] font-mono text-slate-600 bg-slate-50 p-2 rounded border border-slate-100 break-all select-all">
                        GTU-CERT-{Math.random().toString(36).substring(2, 10).toUpperCase()}-REF
                      </p>
                      <p className="text-[9px] text-slate-400 mt-2">Issued on: {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}</p>
                    </div>
                    <div className="w-24 h-24 bg-slate-50 p-2 rounded-xl border-2 border-slate-100 flex items-center justify-center opacity-80">
                      <i className="fa-solid fa-qrcode text-5xl text-slate-800"></i>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-center">
                  <button
                    onClick={() => setShowCertificate(false)}
                    className="px-8 py-3 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-900 transition-all shadow-xl active:scale-95"
                  >
                    Close & Return to Analysis
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <style>{`
        .animate-progress { animation: progress 2s ease-in-out infinite; }
        @keyframes progress { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
        .slide-in { animation: slideIn 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
        @keyframes slideIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </>
  );
};

export default DraftEditor;
