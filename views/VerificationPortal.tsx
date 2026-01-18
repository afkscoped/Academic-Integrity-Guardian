
import React, { useState } from 'react';
import { Submission, LedgerEntry } from '../types';
import { generateHash } from '../services/crypto';

interface VerificationPortalProps {
  submissions: Submission[];
  ledger: LedgerEntry[];
}

const VerificationPortal: React.FC<VerificationPortalProps> = ({ submissions, ledger }) => {
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState<{
    found: boolean;
    entry?: LedgerEntry;
    submission?: Submission;
    hash: string;
  } | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const verifyContent = async () => {
    if (!inputText.trim()) return;
    setIsVerifying(true);
    setResult(null);

    // Artificial delay to simulate blockchain lookup
    await new Promise(r => setTimeout(r, 1500));

    const hash = await generateHash(inputText);
    const ledgerEntry = ledger.find(l => l.hash === hash);
    const sub = submissions.find(s => s.hash === hash);

    setResult({
      found: !!ledgerEntry,
      entry: ledgerEntry,
      submission: sub,
      hash: hash
    });
    setIsVerifying(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-indigo-900 p-12 rounded-2xl text-white text-center shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
           <i className="fa-solid fa-fingerprint text-9xl"></i>
        </div>
        <h2 className="text-3xl font-bold mb-4">Originality Verification Engine</h2>
        <p className="text-indigo-200 mb-8 max-w-xl mx-auto">
          Paste the document content below to verify its integrity and existence within the institutional immutable ledger. 
          No document content is stored permanently; only cryptographic proof is verified.
        </p>

        <div className="relative group">
          <textarea 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="w-full h-48 bg-white/10 border border-white/20 rounded-xl p-6 text-white placeholder-indigo-300/50 focus:bg-white/15 outline-none transition-all resize-none mb-6"
            placeholder="Enter text to verify..."
          ></textarea>
          <button 
            onClick={verifyContent}
            disabled={isVerifying || !inputText}
            className="px-8 py-3 bg-white text-indigo-900 rounded-full font-bold shadow-lg hover:bg-indigo-50 disabled:opacity-50 transition-all flex items-center gap-2 mx-auto"
          >
            {isVerifying ? <i className="fa-solid fa-spinner animate-spin"></i> : <i className="fa-solid fa-shield-check"></i>}
            Run Zero-Knowledge Verification
          </button>
        </div>
      </div>

      {result && (
        <div className={`p-8 rounded-2xl border slide-in ${result.found ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <div className="flex items-start gap-6">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl ${result.found ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
              <i className={`fa-solid ${result.found ? 'fa-certificate' : 'fa-triangle-exclamation'}`}></i>
            </div>
            <div className="flex-1">
              <h3 className={`text-xl font-bold mb-1 ${result.found ? 'text-green-800' : 'text-red-800'}`}>
                {result.found ? 'Authentic Record Found' : 'No Verification Match'}
              </h3>
              <p className="text-sm font-mono text-slate-500 mb-4 break-all">SHA-256: {result.hash}</p>
              
              {result.found ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-white/50 p-3 rounded-lg border border-green-100">
                    <p className="text-[10px] text-green-600 font-bold uppercase tracking-widest">Actor</p>
                    <p className="text-sm font-semibold text-slate-700">{result.entry?.actor}</p>
                  </div>
                  <div className="bg-white/50 p-3 rounded-lg border border-green-100">
                    <p className="text-[10px] text-green-600 font-bold uppercase tracking-widest">Timestamp</p>
                    <p className="text-sm font-semibold text-slate-700">{new Date(result.entry?.timestamp || '').toLocaleString()}</p>
                  </div>
                  <div className="bg-white/50 p-3 rounded-lg border border-green-100">
                    <p className="text-[10px] text-green-600 font-bold uppercase tracking-widest">Similarity at Submission</p>
                    <p className="text-sm font-semibold text-slate-700">{result.submission?.similarityScore}%</p>
                  </div>
                  <div className="bg-white/50 p-3 rounded-lg border border-green-100">
                    <p className="text-[10px] text-green-600 font-bold uppercase tracking-widest">Action</p>
                    <p className="text-sm font-semibold text-slate-700">{result.entry?.action}</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-red-600">
                  This content does not match any existing hash in the institutional ledger. This could mean the document has been altered or was never formally submitted.
                </p>
              )}
            </div>
            {result.found && (
              <div className="hidden lg:block">
                 <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-sm text-center">
                    <i className="fa-solid fa-qrcode text-6xl mb-2 text-slate-800"></i>
                    <p className="text-[8px] font-bold text-slate-400 tracking-tighter uppercase">Verifiable Certificate ID</p>
                    <p className="text-[10px] font-mono text-slate-600 uppercase">GTU-CERT-{result.hash.substring(0, 8)}</p>
                 </div>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        .slide-in { animation: slideIn 0.5s ease-out; }
        @keyframes slideIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default VerificationPortal;
