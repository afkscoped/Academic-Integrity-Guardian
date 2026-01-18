import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  ShieldCheck,
  Cpu,
  Zap,
  History,
  Trash2,
  Award,
  BookOpen,
  Save,
  Loader2,
  Settings2
} from 'lucide-react';
import { generateHash } from '../services/crypto';
import { analyzeSemanticSimilarity, getWritingSuggestions } from '../services/aiService';
import { Submission, SimilarityAnalysis } from '../types';

// Modular Components
import { WritingStatsBar } from '../components/editor/WritingStatsBar';
import { ZenModeToggle } from '../components/editor/ZenModeToggle';
import { HeatmapOverlay } from '../components/editor/HeatmapOverlay';
import { CitationToast } from '../components/editor/CitationToast';
import { DiffViewer } from '../components/editor/DiffViewer';
import { ThemeToggle } from '../components/ThemeToggle';
import { IntegrityCertificate } from '../components/editor/IntegrityCertificate';
import { EditorOptionsPanel, EditorFeatureOptions } from '../components/editor/EditorOptionsPanel';

// Hooks
import { useAutoSave } from '../hooks/useAutoSave';

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
  const [contentHash, setContentHash] = useState('');

  // Feature States
  const [showCertificate, setShowCertificate] = useState(false);
  const [isZen, setIsZen] = useState(false);
  const [showDiff, setShowDiff] = useState(false);
  const [lastPastedUrl, setLastPastedUrl] = useState<string | null>(null);
  const [showOptionsPanel, setShowOptionsPanel] = useState(false);

  // Feature Options (Toggle States)
  const [featureOptions, setFeatureOptions] = useState<EditorFeatureOptions>({
    heatmapEnabled: true,
    citationAutoFix: true,
    autoSaveEnabled: true,
    zenModeEnabled: true,
    diffViewerEnabled: true,
    writingStatsEnabled: true,
  });

  // Auto-Save Hook
  const { lastSaved, isSaving, loadSaved } = useAutoSave(
    featureOptions.autoSaveEnabled ? content : ''
  );

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Hydrate on mount
  useEffect(() => {
    if (featureOptions.autoSaveEnabled) {
      const saved = loadSaved();
      if (saved && !content) setContent(saved);
    }
  }, []);

  // Zen Mode Effect
  useEffect(() => {
    if (isZen && featureOptions.zenModeEnabled) {
      document.body.classList.add('zen-active');
    } else {
      document.body.classList.remove('zen-active');
    }
    return () => document.body.classList.remove('zen-active');
  }, [isZen, featureOptions.zenModeEnabled]);

  const toggleFeature = (key: keyof EditorFeatureOptions) => {
    setFeatureOptions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const runAnalysis = async () => {
    if (!content.trim()) return;
    setIsAnalyzing(true);
    setAnalysis(null);
    setSuggestions('');

    try {
      setLoadingStep('Initializing Neural Engine...');
      const hash = await generateHash(content);
      setContentHash(hash);

      setLoadingStep('Quantifying Semantic Overlap...');
      const result = await analyzeSemanticSimilarity(content);
      setAnalysis(result);

      setLoadingStep('Synthesizing Writing Intelligence...');
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

  // Paste Handling for URLs
  const handlePaste = (e: React.ClipboardEvent) => {
    if (!featureOptions.citationAutoFix) return;
    const text = e.clipboardData.getData('text');
    const urlPattern = /(https?:\/\/[^\s]+)/g;
    const match = text.match(urlPattern);
    if (match) {
      setLastPastedUrl(match[0]);
      setTimeout(() => setLastPastedUrl(null), 10000);
    }
  };

  const formatCitation = (url: string) => {
    const mockCitation = `(Academic Source, 2024). Retrieved from ${url}`;
    setContent(prev => prev.replace(url, mockCitation));
    setLastPastedUrl(null);
  };

  const clearDraft = () => {
    if (confirm("Clear current draft? Data on device will be reset.")) {
      setContent('');
      localStorage.removeItem('currentDraft');
    }
  };

  return (
    <div className={`transition-all duration-700 ${isZen && featureOptions.zenModeEnabled ? 'max-w-4xl mx-auto pt-10' : ''}`}>
      <div className="flex flex-col gap-6">
        {/* Toolbar */}
        <div className="flex justify-between items-center gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-2xl glass border transition-all ${isZen ? 'hidden' : 'flex'}`} style={{ borderColor: 'var(--border-strong)' }}>
              <input
                type="text"
                placeholder="Document Title"
                className="bg-transparent font-bold text-lg outline-none min-w-[300px]"
                style={{ color: 'var(--text-primary)' }}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              {featureOptions.zenModeEnabled && (
                <ZenModeToggle isZen={isZen} onToggle={() => setIsZen(!isZen)} />
              )}
              <ThemeToggle />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowOptionsPanel(true)}
                className="p-2.5 rounded-xl glass border border-white/10 text-white/70 hover:text-white transition-all shadow-lg flex items-center justify-center"
                title="Editor Options"
              >
                <Settings2 size={18} />
              </motion.button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {featureOptions.diffViewerEnabled && (
              <button
                onClick={() => setShowDiff(true)}
                className="btn-premium glass text-accent-primary flex items-center gap-2"
              >
                <History size={16} /> Compare
              </button>
            )}
            <button
              onClick={clearDraft}
              className="p-3 rounded-xl glass hover:bg-error/10 hover:border-error/30 text-error/70 hover:text-error transition-all"
            >
              <Trash2 size={18} />
            </button>
            <button
              onClick={runAnalysis}
              disabled={isAnalyzing || !content}
              className="btn-premium btn-primary flex items-center gap-2 px-6"
            >
              {isAnalyzing ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
              <span className="uppercase tracking-widest">Run Analysis</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Editor Surface */}
          <div className={`${isZen && featureOptions.zenModeEnabled ? 'lg:col-span-12' : 'lg:col-span-8'} space-y-4`}>
            <div
              className="relative glass rounded-[2rem] border animate-scale-in flex flex-col min-h-[650px] overflow-hidden"
              style={{ borderColor: 'var(--border-strong)', background: 'var(--bg-elevated)' }}
            >
              {/* Internal Status Bar */}
              <div className="px-10 py-4 border-b flex justify-between items-center bg-white/5" style={{ borderColor: 'var(--border-subtle)' }}>
                <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--text-tertiary)' }}>
                  <div className="flex items-center gap-1.5 text-accent-primary blockchain-node">
                    <Cpu size={12} />
                    Neural Processor Active
                  </div>
                  {featureOptions.autoSaveEnabled && (
                    isSaving ? (
                      <span className="flex items-center gap-1.5 animate-pulse text-accent-secondary">
                        <Save size={12} /> Syncing to device...
                      </span>
                    ) : lastSaved && (
                      <span className="text-success opacity-60">
                        Saved {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <Award size={14} className="text-warning opacity-50" />
                  <BookOpen size={14} className="text-info opacity-50" />
                </div>
              </div>

              <div className="relative flex-1 p-10">
                <AnimatePresence mode="wait">
                  {analysis && featureOptions.heatmapEnabled ? (
                    <motion.div
                      key="heatmap"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-lg font-serif leading-[1.8] h-full overflow-y-auto"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      <HeatmapOverlay content={content} segments={analysis.segments} />
                      <div className="mt-12 pt-8 border-t flex justify-center" style={{ borderColor: 'var(--border-subtle)' }}>
                        <button
                          onClick={() => setAnalysis(null)}
                          className="btn-premium glass text-accent-primary flex items-center gap-2"
                        >
                          <Zap size={16} /> Return to Neural Editor
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.textarea
                      key="editor"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      ref={textareaRef}
                      onPaste={handlePaste}
                      className="w-full h-full bg-transparent outline-none resize-none text-lg font-serif leading-[1.8]"
                      style={{ color: 'var(--text-primary)' }}
                      placeholder="Begin your academic inquiry here... (URL detection and auto-save active)"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                    />
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Side Intelligence Panel */}
          {!(isZen && featureOptions.zenModeEnabled) && (
            <div className="lg:col-span-4 space-y-6">
              <AnimatePresence>
                {isAnalyzing && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="card-premium node-active"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <Loader2 size={18} className="text-accent-primary animate-spin" />
                      <h3 className="text-sm font-black uppercase tracking-widest">Processing Intelligence</h3>
                    </div>
                    <p className="text-xs italic mb-4" style={{ color: 'var(--text-secondary)' }}>{loadingStep}</p>
                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className="w-full h-full data-stream" />
                    </div>
                  </motion.div>
                )}

                {analysis && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card-premium border-accent-primary/30"
                    style={{ boxShadow: 'var(--shadow-glow)' }}
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h3 className="text-sm font-black uppercase tracking-widest">Integrity Report</h3>
                        <p className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>Verification ID: {contentHash.substring(0, 8).toUpperCase()}</p>
                      </div>
                      <div className="text-right">
                        <span className={`text-4xl font-black ${analysis.score > 30 ? 'text-error' : 'text-success'}`}>{analysis.score}%</span>
                        <p className="text-[9px] font-bold uppercase tracking-tighter" style={{ color: 'var(--text-tertiary)' }}>Similarity</p>
                      </div>
                    </div>

                    <p className="text-xs leading-relaxed italic p-3 rounded-xl bg-black/20 border" style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}>
                      "{analysis.summary}"
                    </p>

                    <div className="mt-6 flex justify-center">
                      <button
                        onClick={() => setShowCertificate(true)}
                        className="btn-premium btn-primary w-full flex items-center justify-center gap-2"
                      >
                        <Award size={16} /> View Cryptographic Certificate
                      </button>
                    </div>
                  </motion.div>
                )}

                {suggestions && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card-premium bg-accent-gradient text-white"
                  >
                    <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2 mb-4">
                      <Sparkles size={16} /> Neural Writing Coach
                    </h3>
                    <p className="text-xs leading-relaxed font-medium opacity-90 whitespace-pre-wrap">
                      {suggestions}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Tech Badge */}
              <div className="p-6 rounded-3xl glass border border-white/5 text-center blockchain-chain">
                <div className="inline-flex p-3 rounded-2xl bg-white/5 mb-4 blockchain-node">
                  <ShieldCheck size={28} className="text-accent-primary" />
                </div>
                <h3 className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-primary)' }}>End-to-End Encryption</h3>
                <p className="text-[10px] leading-relaxed" style={{ color: 'var(--text-tertiary)' }}>
                  Your draft is processed using zero-knowledge architecture. No raw text is ever persisted to our central ledger.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Feature 6: Writing Stats Bar */}
      {featureOptions.writingStatsEnabled && <WritingStatsBar content={content} />}

      {/* Feature 2: Citation Toast */}
      {featureOptions.citationAutoFix && (
        <CitationToast
          lastPastedUrl={lastPastedUrl}
          onDismiss={() => setLastPastedUrl(null)}
          onFormat={formatCitation}
        />
      )}

      {/* Feature 5: Diff Viewer */}
      <AnimatePresence>
        {showDiff && featureOptions.diffViewerEnabled && (
          <DiffViewer currentContent={content} onClose={() => setShowDiff(false)} />
        )}
      </AnimatePresence>

      {/* Feature 7: Integrity Certificate */}
      <IntegrityCertificate
        isOpen={showCertificate}
        onClose={() => setShowCertificate(false)}
        title={title || 'Untitled Draft'}
        content={content}
        score={analysis?.score || 0}
        hash={contentHash}
      />

      {/* Feature Options Panel */}
      <EditorOptionsPanel
        isOpen={showOptionsPanel}
        onClose={() => setShowOptionsPanel(false)}
        options={featureOptions}
        onToggle={toggleFeature}
      />
    </div>
  );
};

export default DraftEditor;
